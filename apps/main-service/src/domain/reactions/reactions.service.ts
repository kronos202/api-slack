import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ReactionsService {
  constructor(protected databaseService: DatabaseService) {}

  // async toggleReaction(
  //   userId: string,
  //   messageId: string,
  //   value: string,
  // ): Promise<string> {
  //   // Check if the message exists
  //   const message = await this.databaseService.message.findUnique({
  //     where: { id: messageId },
  //   });

  //   if (!message) {
  //     throw new NotFoundException('Message not found');
  //   }

  //   // Check if the user is a member of the workspace (or authorized)
  //   const member = await this.databaseService.member.findUnique({
  //     where: {
  //       userId_workspaceId: { userId, workspaceId: message.workspaceId },
  //     },
  //   });

  //   if (!member) {
  //     throw new UnauthorizedException('User is not authorized');
  //   }

  //   // Check if the reaction already exists for the user
  //   const existingReaction = await this.databaseService.reaction.findFirst({
  //     where: {
  //       messageId,
  //       memberId: userId,
  //       value,
  //     },
  //   });

  //   if (existingReaction) {
  //     // Remove the reaction if it exists
  //     await this.databaseService.reaction.delete({
  //       where: { id: existingReaction.id },
  //     });
  //     return existingReaction.id;
  //   } else {
  //     // Add a new reaction
  //     const newReaction = await this.databaseService.reaction.create({
  //       data: {
  //         value,
  //         memberId: userId,
  //         messageId,
  //         workspaceId: message.workspaceId,
  //       },
  //     });
  //     return newReaction.id;
  //   }
  // }

  async toggleReaction(userId: string, messageId: string, value: string) {
    // Kiểm tra xem message có tồn tại và user có quyền truy cập hay không
    const messageWithWorkspace = await this.databaseService.message.findFirst({
      where: {
        id: messageId,
        workspace: {
          Member: {
            some: { userId }, // Kiểm tra user là thành viên của workspace
          },
        },
      },
      include: {
        workspace: { select: { id: true } },
      },
    });

    if (!messageWithWorkspace) {
      throw new NotFoundException('Message not found or user not authorized');
    }

    // Tìm Member ID tương ứng với userId trong workspace
    const member = await this.databaseService.member.findFirst({
      where: {
        userId,
        workspaceId: messageWithWorkspace.workspace.id,
      },
    });

    if (!member) {
      throw new UnauthorizedException('User is not a member of this workspace');
    }

    // Kiểm tra xem reaction đã tồn tại chưa
    const existingReaction = await this.databaseService.reaction.findFirst({
      where: {
        messageId,
        memberId: member.id,
        value,
      },
    });

    if (existingReaction) {
      // Xóa reaction nếu đã tồn tại
      await this.databaseService.reaction.delete({
        where: { id: existingReaction.id },
      });
      return {
        action: 'removed',
        reactionId: existingReaction.id,
      };
    }

    // Tạo reaction mới
    const newReaction = await this.databaseService.reaction.create({
      data: {
        value,
        memberId: member.id,
        messageId,
        workspaceId: messageWithWorkspace.workspace.id,
      },
    });

    return {
      action: 'added',
      reactionId: newReaction.id,
    };
  }
}
