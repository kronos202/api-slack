import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { DatabaseService } from 'src/database/database.service';
import { RoleEnum } from 'src/common/enums/role.enum';

@Injectable()
export class ChannelsService {
  constructor(protected databaseService: DatabaseService) {}

  async createChannel(
    createChannelDto: CreateChannelDto,
    userId: string,
    workspaceId: string,
  ) {
    const { name, isPrivate } = createChannelDto;
    const member = await this.databaseService.member.findUnique({
      where: {
        userId_workspaceId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found in this workspace');
    }

    if (member.role !== RoleEnum.ADMIN) {
      throw new UnauthorizedException(
        'You do not have permission to create a channel',
      );
    }

    const channel = await this.databaseService.channel.create({
      data: {
        name: name.replace(/\s/g, '-').toLowerCase(),
        workspaceId,
        isPrivate,
      },
    });

    return channel.id;
  }

  async updateChannel(
    updateChannelDto: UpdateChannelDto,
    userId: string,
    channelId: string,
  ) {
    const { isPrivate, name } = updateChannelDto;
    const member = await this.checkChannelAccess(channelId, userId);

    if (!member || member.role !== RoleEnum.ADMIN) {
      throw new UnauthorizedException(
        'You do not have permission to update this channel',
      );
    }

    const updatedChannel = await this.databaseService.channel.update({
      where: { id: channelId },
      data: { name, isPrivate },
    });

    return updatedChannel;
  }

  async removeChannel(userId: string, channelId: string) {
    const member = await this.checkChannelAccess(channelId, userId);

    if (!member || member.role !== 'ADMIN') {
      throw new UnauthorizedException(
        'You are not authorized to delete this channel',
      );
    }

    // 3. Xóa trong transaction: messages trước, channel sau
    await this.databaseService.$transaction([
      this.databaseService.message.deleteMany({
        where: { channelId },
      }),
      this.databaseService.channel.delete({
        where: { id: channelId },
      }),
    ]);

    return {
      message: 'Kênh đã được xóa thành công',
    };
  }

  // workspace-channel.service.ts
  async getChannelsByWorkspace(userId: string, workspaceId: string) {
    const member = await this.databaseService.member.findUnique({
      where: {
        userId_workspaceId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('Bạn không thuộc workspace này');
    }

    const channels = await this.databaseService.channel.findMany({
      where: { workspaceId, isPrivate: false },
    });

    return channels;
  }

  // workspace-channel.service.ts
  async getChannelById(userId: string, channelId: string) {
    const channel = await this.databaseService.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      throw new NotFoundException('Channel không tồn tại');
    }

    await this.checkChannelAccess(channelId, userId);

    if (channel.isPrivate) {
      const isChannelMember =
        await this.databaseService.memberChannel.findFirst({
          where: {
            memberId: userId,
            channelId,
          },
        });

      if (!isChannelMember) {
        throw new ForbiddenException(
          'Bạn không có quyền truy cập channel riêng tư này',
        );
      }
    }

    return channel;
  }

  async getMessagesInChannel(
    userId: string,
    channelId: string,
    limit = 50,
    cursor?: string,
  ) {
    // 1. Kiểm tra channel có tồn tại
    const channel = await this.databaseService.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      throw new NotFoundException('Channel không tồn tại');
    }

    // 2. Kiểm tra người dùng có thuộc workspace/channel không
    await this.checkChannelAccess(channelId, userId);

    // (Optional) Nếu channel là private, kiểm tra user có được quyền vào

    // 3. Query tin nhắn với phân trang bằng cursor
    return this.databaseService.message.findMany({
      where: { channelId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100), // giới hạn max 100 messages/lần
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1, // bỏ qua cursor hiện tại
      }),
    });
  }

  async checkChannelAccess(channelId: string, userId: string) {
    const channel = await this.databaseService.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found.');
    }

    const member = await this.databaseService.member.findUnique({
      where: {
        userId_workspaceId: {
          workspaceId: channel.workspaceId,
          userId,
        },
      },
    });

    if (!member) {
      throw new UnauthorizedException(
        'User is not a member of this workspace.',
      );
    }

    return member; // Có thể dùng để check role tiếp theo
  }
}
