import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { RoleEnum } from 'src/common/enums/role.enum';

@Injectable()
export class MembersService {
  constructor(protected databaseService: DatabaseService) {}

  async getMembers(workspaceId: string, userId: string) {
    const currentMember = await this.getMember(workspaceId, userId);
    if (!currentMember) throw new ForbiddenException('Unauthorized');

    const members = await this.databaseService.member.findMany({
      where: { workspaceId },
      include: { user: true },
    });

    return members;
  }

  async getMemberById(workspaceId: string, userId: string) {
    const member = await this.getMember(workspaceId, userId);
    if (!member) throw new ForbiddenException('Unauthorized');

    return member;
  }

  async updateMemberRole(id: string, role: RoleEnum, userId: string) {
    const member = await this.databaseService.member.findUnique({
      where: { id },
    });
    if (!member) throw new NotFoundException('Member not found');

    const currentMember = await this.getMember(member.workspaceId, userId);
    if (!currentMember || currentMember.role !== RoleEnum.ADMIN) {
      throw new ForbiddenException('Unauthorized');
    }

    return this.databaseService.member.update({
      where: { id },
      data: { role },
    });
  }

  async removeMember(memberId: string, userId: string) {
    const member = await this.databaseService.member.findUnique({
      where: { id: memberId },
    });
    if (!member) throw new NotFoundException('Member not found');

    const currentMember = await this.getMember(member.workspaceId, userId);
    if (!currentMember || currentMember.role !== RoleEnum.ADMIN) {
      throw new ForbiddenException(
        'Unauthorized: Only admin can remove a member',
      );
    }

    // Xóa các tin nhắn và phản ứng liên quan đến member
    await Promise.all([
      this.databaseService.message.deleteMany({ where: { memberId } }),
      this.databaseService.reaction.deleteMany({ where: { memberId } }),
    ]);

    // Xóa member khỏi tất cả các conversation
    await this.databaseService.conversationParticipant.deleteMany({
      where: { memberId },
    });

    // Kiểm tra và xóa các conversation không còn participant nào
    const orphanedConversations =
      await this.databaseService.conversation.findMany({
        where: {
          participants: {
            none: {}, // Lấy các conversation không có participants
          },
        },
      });

    await Promise.all(
      orphanedConversations.map((conversation) =>
        this.databaseService.conversation.delete({
          where: { id: conversation.id },
        }),
      ),
    );

    // Xóa member khỏi workspace
    await this.databaseService.member.delete({ where: { id: memberId } });

    return {
      message: 'Delete thành công user',
    };
  }

  private async getMember(workspaceId: string, userId: string) {
    const member = await this.databaseService.member.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    if (!member) throw new NotFoundException('Not found member');

    return member;
  }
}
