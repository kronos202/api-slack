import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { DatabaseService } from 'src/database/database.service';
import { UploadService } from 'src/upload/upload.service';
import { Prisma, StorageType } from '@prisma/client';
import { CreateMessageWithImagesDto } from './dto/create-message-image.dto';

@Injectable()
export class MessagesService {
  constructor(
    protected databaseService: DatabaseService,
    private readonly uploadService: UploadService,
  ) {}

  async getMessagesByConversation(
    conversationId: string,
    workspaceId: string,
    userId: string,
    page: number = 1,
    pageSize: number = 20,
  ) {
    const member = await this.databaseService.member.findFirst({
      where: { workspaceId, userId },
    });

    if (!member) {
      throw new UnauthorizedException('User is not a member of the workspace');
    }

    const conversation = await this.databaseService.conversation.findFirst({
      where: { id: conversationId, workspaceId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found in the workspace');
    }

    const messages = await this.databaseService.message.findMany({
      where: { conversationId, workspaceId },
      include: {
        member: {
          include: { user: true },
        },
        reaction: true,
        Image: true,
      },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalMessages = await this.databaseService.message.count({
      where: { conversationId, workspaceId },
    });

    return {
      messages,
      totalMessages,
      totalPages: Math.ceil(totalMessages / pageSize),
      currentPage: page,
    };
  }

  async getMessageById(messageId: string, userId: string) {
    const message = await this.databaseService.message.findUnique({
      where: { id: messageId },
      include: {
        member: true,
        reaction: true,
        parentMessage: true,
        workspace: true,
        Image: true,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    const member = await this.databaseService.member.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId: message.workspaceId },
      },
    });

    if (!member) {
      throw new UnauthorizedException('User is not a member of the workspace');
    }

    const reactionsWithCount = await this.populateReactions(message.id);
    const thread = await this.populateThread(message.id);

    return {
      ...message,
      reactions: reactionsWithCount,
      thread,
    };
  }

  async populateReactions(messageId: string) {
    // const reactions = await this.databaseService.reaction.findMany({
    //   where: { messageId },
    // });

    // const reactionsWithCount = reactions.map((reaction) => ({
    //   ...reaction,
    //   count: reactions.filter((r) => r.value === reaction.value).length,
    // }));

    const reactionsWithCount = await this.databaseService.reaction.groupBy({
      by: ['value'],
      where: { messageId },
      _count: {
        value: true,
      },
    });

    // Đổi tên _count thành count để dễ hiểu
    const reactions = reactionsWithCount.map((reaction) => ({
      value: reaction.value,
      count: reaction._count.value,
    }));

    // Nếu không có reaction nào, trả về mảng rỗng hoặc thông báo mặc định
    if (reactions.length === 0) {
      return [];
    }

    return reactionsWithCount;
  }

  async populateThread(messageId: string) {
    const threadMessages = await this.databaseService.message.findMany({
      where: { parentMessageId: messageId },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    if (threadMessages.length === 0) {
      return { count: 0, image: null, timestamp: 0, name: '' };
    }

    const lastMessage = threadMessages[threadMessages.length - 1];
    const lastMessageMember = lastMessage.member?.user;

    return {
      count: threadMessages.length,
      image: lastMessageMember?.avatar || null,
      timestamp: lastMessage.createdAt.getTime(),
      name: lastMessageMember?.username || '',
    };
  }
  async createMessageWithImages(
    userId: string,
    files: Express.Multer.File[],
    createMessageWithImagesDto: CreateMessageWithImagesDto,
  ) {
    const { workspaceId, channelId, content, conversationId, parentMessageId } =
      createMessageWithImagesDto;
    // Kiểm tra member
    const member = await this.databaseService.member.findFirst({
      where: { workspaceId, userId },
    });
    if (!member) {
      throw new UnauthorizedException('User is not a member of the workspace');
    }

    let _conversationId = conversationId;

    if (!conversationId && !channelId && parentMessageId) {
      const parentMessage = await this.databaseService.message.findUnique({
        where: { id: parentMessageId },
      });
      if (!parentMessage) {
        throw new NotFoundException('Parent message not found');
      }
      if (parentMessage.conversationId)
        _conversationId = parentMessage.conversationId;
    }

    // Tạo message và upload ảnh song song trong một transaction
    const [newMessage, uploadResults] = await this.databaseService.$transaction(
      async (tx) => {
        // Tạo message
        const message = await tx.message.create({
          data: {
            content,
            workspaceId,
            channelId,
            conversationId: _conversationId,
            memberId: member.id,
            parentMessageId,
          },
        });

        // Nếu có file ảnh, upload lên Cloudinary
        const images = files?.length
          ? await this.uploadService.upload(
              files,
              StorageType.LOCAL,
              userId,
              message.id,
            )
          : [];

        // Lưu thông tin ảnh vào bảng Image
        if (images.length > 0) {
          const imageRecords = images.map((result) => ({
            id: result.public_id,
            imageUrl: result.secure_url,
            userId,
            messageId: message.id,
          }));

          await tx.image.createMany({ data: imageRecords });
        }

        return [message, images];
      },
    );

    return {
      messageId: newMessage,
      images: uploadResults,
    };
  }

  async createMessage(userId: string, createMessageDto: CreateMessageDto) {
    const { content, workspaceId, channelId, conversationId, parentMessageId } =
      createMessageDto;
    // Kiểm tra quyền truy cập của member
    const member = await this.databaseService.member.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });

    if (!member) {
      throw new UnauthorizedException('User is not a member of the workspace');
    }

    let _conversationId = conversationId;

    if (!conversationId && !channelId && parentMessageId) {
      const parentMessage = await this.databaseService.message.findUnique({
        where: { id: parentMessageId },
      });

      if (!parentMessage) {
        throw new NotFoundException('Parent message not found');
      }
      if (parentMessage.conversationId)
        _conversationId = parentMessage.conversationId;
    }

    // Kiểm tra workspaceId
    const workspace = await this.databaseService.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // Kiểm tra channelId
    if (channelId) {
      const channel = await this.databaseService.channel.findUnique({
        where: { id: channelId },
      });
      if (!channel) {
        throw new NotFoundException('Channel not found');
      }
    }

    // Kiểm tra conversationId
    if (_conversationId) {
      const conversation = await this.databaseService.conversation.findUnique({
        where: { id: _conversationId },
      });
      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }
    }

    // Tạo message
    const newMessage = await this.databaseService.message.create({
      data: {
        content,
        workspaceId,
        channelId,
        conversationId: _conversationId,
        memberId: member.id,
        parentMessageId,
      },
    });

    return newMessage.id;
  }

  async updateMessage(messageId: string, userId: string, content?: string) {
    const message = await this.databaseService.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Kiểm tra xem người dùng có quyền chỉnh sửa message
    const member = await this.databaseService.member.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId: message.workspaceId },
      },
    });

    if (!member || member.id !== message.memberId) {
      throw new UnauthorizedException(
        'User is not authorized to edit this message',
      );
    }

    await this.databaseService.message.update({
      where: { id: messageId },
      data: { content, updatedAt: new Date() },
    });

    return messageId;
  }

  async countMessagesInConversation(conversationId: string) {
    // Kiểm tra xem conversationId có tồn tại trong cơ sở dữ liệu không
    const conversation = await this.databaseService.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Đếm số lượng tin nhắn trong conversation
    return this.databaseService.message.count({
      where: { conversationId },
    });
  }

  async searchMessages(
    workspaceId: string,
    userId: string,
    keyword: string,
    conversationId?: string,
    channelId?: string,
  ) {
    const member = await this.databaseService.member.findFirst({
      where: { workspaceId, userId },
    });

    if (!member) {
      throw new UnauthorizedException('User is not a member of the workspace');
    }

    // Xây dựng đối tượng where cho tìm kiếm
    const where: Prisma.MessageWhereInput = {
      workspaceId,
      content: {
        contains: keyword,
        mode: 'insensitive', // Tìm kiếm không phân biệt chữ hoa chữ thường
      },
    };

    // Chỉ thêm điều kiện conversationId hoặc channelId nếu có
    if (conversationId) where.conversationId = conversationId;
    if (channelId) where.channelId = channelId;

    // Tìm kiếm messages
    const messages = await this.databaseService.message.findMany({
      where,
      include: {
        member: {
          include: { user: true },
        },
        reaction: true,
        Image: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Kiểm tra nếu không tìm thấy tin nhắn nào
    if (messages.length === 0) {
      throw new NotFoundException('No messages found matching the keyword');
    }

    return messages;
  }

  async getMessageStatistics(conversationId: string, workspaceId: string) {
    // Đếm tổng số tin nhắn
    const totalMessagesPromise = this.databaseService.message.count({
      where: { conversationId, workspaceId },
    });

    // Lấy top người gửi
    const topSendersPromise = this.databaseService.message.groupBy({
      by: ['memberId'],
      where: { conversationId, workspaceId },
      _count: { memberId: true },
      orderBy: {
        _count: { memberId: 'desc' },
      },
      take: 5, // Lấy top 5 người gửi nhiều nhất
    });

    // Lấy top phản ứng
    const topReactionsPromise = this.databaseService.reaction.groupBy({
      by: ['value'],
      where: { message: { conversationId, workspaceId } },
      _count: { value: true },
      orderBy: {
        _count: { value: 'desc' },
      },
      take: 5, // Lấy top 5 loại phản ứng
    });

    // Chạy các truy vấn song song
    const [totalMessages, topSenders, topReactions] = await Promise.all([
      totalMessagesPromise,
      topSendersPromise,
      topReactionsPromise,
    ]);

    return {
      totalMessages,
      topSenders,
      topReactions,
    };
  }

  async countMessagesInWorkspace(workspaceId: string) {
    return this.databaseService.message.count({
      where: { workspaceId },
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.databaseService.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    const member = await this.databaseService.member.findFirst({
      where: {
        workspaceId: message.workspaceId,
        userId,
      },
    });

    if (!member || member.id !== message.memberId) {
      throw new UnauthorizedException(
        'User is not authorized to delete this message',
      );
    }

    await this.databaseService.message.delete({
      where: { id: messageId },
    });

    return messageId;
  }
}
