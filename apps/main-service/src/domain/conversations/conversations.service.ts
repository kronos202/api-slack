import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { DatabaseService } from 'src/database/database.service';
import { AddRemoveParticipantDto } from './dto/add-remove-participant.dto';
import { MembersService } from '../members/members.service';

@Injectable()
export class ConversationsService {
  constructor(
    protected databaseService: DatabaseService,
    private readonly membersService: MembersService,
  ) {}

  async create(createConversationDto: CreateConversationDto, userId: string) {
    const { workspaceId, participantIds } = createConversationDto;

    const workspace = await this.databaseService.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found.');
    }

    const member = await this.membersService.getMemberById(workspaceId, userId);

    if (!member) {
      throw new ForbiddenException('User is not a member of the workspace.');
    }

    const allParticipantIds = [member.id, ...participantIds];

    // Kiểm tra tất cả các participant có thuộc workspace không
    const members = await this.databaseService.member.findMany({
      where: {
        workspaceId,
        id: { in: allParticipantIds },
      },
    });

    if (members.length !== allParticipantIds.length) {
      throw new NotFoundException(
        'One or more participants are not part of the workspace.',
      );
    }

    // Tạo conversation trong transaction để đảm bảo tính toàn vẹn dữ liệu
    const conversation = await this.databaseService.$transaction(async (tx) => {
      const conversation = await tx.conversation.create({
        data: {
          workspaceId,
          createdBy: member.id,
          participants: {
            create: allParticipantIds.map((id) => ({ memberId: id })),
          },
        },
      });
      return conversation;
    });

    return conversation;
  }

  async findAll(workspaceId: string) {
    const conversations = await this.databaseService.conversation.findMany({
      where: { workspaceId },
      select: {
        id: true,
        participants: {
          select: { memberId: true },
        },
        createdAt: true,
      },
    });

    if (conversations.length == 0) {
      throw new NotFoundException("Don't have any conversation");
    }

    return conversations;
  }

  async findOne(conversationId: string) {
    const conversation = await this.databaseService.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true, messages: true },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found.');
    }

    return conversation;
  }

  async addParticipant(
    addParticipantDto: AddRemoveParticipantDto,
    conversationId: string,
    // workspaceId: string,
  ) {
    const { memberId } = addParticipantDto;

    // Kiểm tra conversation có tồn tại không
    const conversation = await this.databaseService.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found.');
    }

    // Thêm participant
    return this.databaseService.conversationParticipant.create({
      data: { conversationId, memberId },
    });
  }

  async removeParticipant(
    workspaceId: string,
    conversationId: string,
    memberId: string,
    userId: string,
  ) {
    const conversation = await this.databaseService.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('NotFound');
    }

    const participant =
      await this.databaseService.conversationParticipant.findFirst({
        where: { conversationId, memberId },
      });

    if (!participant) {
      throw new NotFoundException(
        'Participant not found in this conversation.',
      );
    }

    const member = await this.membersService.getMemberById(workspaceId, userId);

    if (member.id !== conversation.createdBy) {
      throw new UnauthorizedException('Unauthorized, cant delete conversation');
    }

    return this.databaseService.conversationParticipant.delete({
      where: { id: participant.id },
    });
  }

  async checkAccess(conversationId: string, userId: string) {
    const member = await this.databaseService.member.findFirst({
      where: { userId },
    });

    if (!member) {
      throw new UnauthorizedException('User is not part of the workspace.');
    }

    const participant =
      await this.databaseService.conversationParticipant.findFirst({
        where: { conversationId, memberId: member.id },
      });

    if (!participant) {
      throw new ForbiddenException('Access to this conversation is denied.');
    }

    return participant;
  }

  async getParticipants(conversationId: string) {
    return this.databaseService.conversationParticipant.findMany({
      where: { conversationId },
      include: { member: true },
    });
  }

  async remove(conversationId: string, userId: string, workspaceId: string) {
    const conversation = await this.databaseService.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('NotFound');
    }

    const member = await this.membersService.getMemberById(workspaceId, userId);

    if (member.id !== conversation.createdBy) {
      throw new UnauthorizedException('Unauthorized, cant delete conversation');
    }

    return this.databaseService.conversation.delete({
      where: { id: conversationId },
    });
  }
}
