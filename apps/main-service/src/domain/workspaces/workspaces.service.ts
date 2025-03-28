import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '@prisma/client';
import { RoleEnum } from 'src/common/enums/role.enum';
@Injectable()
export class WorkspacesService {
  constructor(protected databaseService: DatabaseService) {}

  async joinWorkspace(userId: string, joinCode: string) {
    const normalizedJoinCode = joinCode.toLowerCase();

    const workspace = await this.databaseService.workspace.findUnique({
      where: { joinCode: normalizedJoinCode },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const existingMember = await this.databaseService.member.findUnique({
      where: {
        userId_workspaceId: {
          workspaceId: workspace.id,
          userId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException(
        `User ${userId} already joined workspace ${workspace.id}`,
      );
    }

    const member = await this.databaseService.member.create({
      data: {
        userId,
        workspaceId: workspace.id,
        role: RoleEnum.MEMBER,
      },
    });

    return member;
  }

  async newJoinCode(userId: string, workspaceId: string) {
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
      throw new ForbiddenException(
        'You are not authorized to regenerate join code',
      );
    }

    const joinCode = this.generateWorkspaceCode();

    await this.databaseService.workspace.update({
      where: { id: workspaceId },
      data: { joinCode },
    });

    return joinCode;
  }

  async createWorkspace(userId: string, name: string) {
    const joinCode = this.generateWorkspaceCode();

    // Kiểm tra xem workspace đã tồn tại chưa
    const existingWorkspace = await this.databaseService.workspace.findUnique({
      where: { name, joinCode },
    });

    if (existingWorkspace) {
      throw new ConflictException('Workspace with this name already exists');
    }

    // Sử dụng transaction để đảm bảo dữ liệu được tạo toàn vẹn
    const workspace = await this.databaseService.$transaction(
      async (prisma) => {
        // Tạo workspace
        const newWorkspace = await prisma.workspace.create({
          data: {
            name,
            joinCode,
            ownerId: userId,
          },
        });

        // Tạo admin member
        await prisma.member.create({
          data: {
            userId,
            workspaceId: newWorkspace.id,
            id: userId,
            role: RoleEnum.ADMIN, // Hoặc dùng RoleEnum.ADMIN nếu có
          },
        });

        // Tạo kênh mặc định "general"
        await prisma.channel.create({
          data: {
            name: 'general',
            workspaceId: newWorkspace.id,
          },
        });

        return newWorkspace; // Trả về workspace đã tạo
      },
    );

    return workspace;
  }

  async getWorkspaces(userId: string) {
    console.log('userId: ', userId);

    const members = await this.databaseService.member.findMany({
      where: { userId },
    });
    console.log('members: ', members);

    const workspaceIds = members.map((member) => member.workspaceId);

    const workspaces = await this.databaseService.workspace.findMany({
      where: {
        id: {
          in: workspaceIds,
        },
      },
      include: {
        Channel: true,
      },
    });

    return workspaces;
  }

  // workspace.service.ts
  async updateWorkspace(userId: string, workspaceId: string, name: string) {
    const workspace = await this.databaseService.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const member = await this.databaseService.member.findUnique({
      where: {
        userId_workspaceId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!member || member.role !== RoleEnum.ADMIN) {
      throw new UnauthorizedException(
        'Unauthorized: You must be an admin to update this workspace',
      );
    }

    const updatedWorkspace = await this.databaseService.workspace.update({
      where: { id: workspaceId },
      data: { name },
    });

    return updatedWorkspace;
  }

  // workspace.service.ts
  async removeWorkspace(userId: string, workspaceId: string) {
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
        'You are not authorized to delete this workspace',
      );
    }

    // Sử dụng transaction để đảm bảo tính toàn vẹn của dữ liệu
    await this.databaseService.$transaction(async (prisma) => {
      // Xóa các bản ghi liên quan trong workspace
      await prisma.member.deleteMany({
        where: { workspaceId },
      });

      await prisma.channel.deleteMany({
        where: { workspaceId },
      });

      await prisma.conversation.deleteMany({
        where: { workspaceId },
      });

      await prisma.message.deleteMany({
        where: { workspaceId },
      });

      await prisma.reaction.deleteMany({
        where: { workspaceId },
      });

      // Cuối cùng xóa workspace
      await prisma.workspace.delete({
        where: { id: workspaceId },
      });
    });

    return { message: 'Workspace deleted successfully' };
  }

  // workspace.service.ts
  async getWorkspaceInfoById(userId: string, workspaceId: string) {
    const member = await this.databaseService.member.findUnique({
      where: {
        userId_workspaceId: {
          workspaceId,
          userId,
        },
      },
    });

    const workspace = await this.databaseService.workspace.findUnique({
      where: { id: workspaceId },
    });

    return {
      name: workspace?.name,
      isMember: !!member,
    };
  }

  async checkWorkspaceAccess(workspaceId: string, userId: string) {
    const member = await this.databaseService.member.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
    });

    console.log('member: ', member);
    console.log('member: ', !!member);

    if (!member) {
      throw new UnauthorizedException('Access denied to this workspace.');
    }

    return !!member;
  }

  async getMembers(workspaceId: string, userId: string) {
    const isMember = await this.checkWorkspaceAccess(workspaceId, userId);

    if (!isMember) {
      throw new UnauthorizedException('Khong co quyen truy cap!');
    }

    // Kiểm tra xem workspace có tồn tại và có thành viên không
    const members = await this.databaseService.member.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            avatar: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    });

    if (members.length === 0) {
      throw new NotFoundException('No members found for this workspace');
    }

    return members;
  }

  private async validateMemberRole(
    userId: string,
    workspaceId: string,
    requiredRole: RoleEnum,
  ) {
    const member = await this.databaseService.member.findUnique({
      where: {
        userId_workspaceId: { workspaceId, userId },
      },
    });

    if (!member || member.role !== requiredRole) {
      throw new UnauthorizedException(`Requires ${requiredRole} role`);
    }

    return member;
  }

  async leaveWorkspace(userId: string, workspaceId: string) {
    const member = await this.databaseService.member.findUnique({
      where: {
        userId_workspaceId: { workspaceId, userId },
      },
    });

    if (!member) {
      throw new BadRequestException('Not a member of this workspace.');
    }

    if (member.role === RoleEnum.ADMIN) {
      const adminCount = await this.databaseService.member.count({
        where: { workspaceId, role: RoleEnum.ADMIN },
      });

      if (adminCount <= 1) {
        throw new BadRequestException(
          'Cannot leave workspace as the only admin.',
        );
      }
    }

    // Sử dụng transaction để đảm bảo toàn vẹn dữ liệu khi xóa thành viên
    await this.databaseService.$transaction(async (prisma) => {
      // Xóa thành viên khỏi workspace
      await prisma.member.delete({
        where: {
          userId_workspaceId: { workspaceId, userId },
        },
      });
    });

    return { message: 'Left workspace successfully' };
  }

  // async searchWorkspaces(keyword: string) {
  //   return this.databaseService.workspace.findMany({
  //     where: {
  //       name: {
  //         contains: keyword,
  //         mode: 'insensitive',
  //       },
  //     },
  //   });
  // }

  async transferAdminRole(
    userId: string,
    workspaceId: string,
    newAdminId: string,
  ) {
    await this.validateMemberRole(userId, workspaceId, RoleEnum.ADMIN);

    const newAdmin = await this.databaseService.member.findUnique({
      where: {
        userId_workspaceId: { workspaceId, userId: newAdminId },
      },
    });

    if (!newAdmin) {
      throw new NotFoundException(
        'New admin must be a member of the workspace.',
      );
    }

    // Sử dụng transaction để đảm bảo cả hai thao tác update đều thành công
    await this.databaseService.$transaction(async (prisma) => {
      // Cập nhật vai trò của người yêu cầu chuyển admin thành MEMBER
      await prisma.member.update({
        where: {
          userId_workspaceId: { workspaceId, userId },
        },
        data: { role: RoleEnum.MEMBER },
      });

      // Cập nhật vai trò của người nhận quyền admin thành ADMIN
      await prisma.member.update({
        where: {
          userId_workspaceId: { workspaceId, userId: newAdminId },
        },
        data: { role: RoleEnum.ADMIN },
      });
    });

    return { message: 'Admin role transferred successfully' };
  }

  async addMembers(workspaceId: string, userId: string, userIds: string[]) {
    const isMember = await this.checkWorkspaceAccess(workspaceId, userId);

    if (!isMember) {
      throw new UnauthorizedException('ko phai la thanh vien cua workspace');
    }

    // Kiểm tra xem các userIds có hợp lệ không
    const existingUsers = await this.databaseService.user.findMany({
      where: {
        id: { in: userIds }, // Lọc những người dùng có userId trong danh sách userIds
      },
    });

    if (existingUsers.length !== userIds.length) {
      throw new NotFoundException('Some user IDs do not exist');
    }

    // Kiểm tra xem người dùng đã là thành viên trong workspace chưa
    const existingMembers = await this.databaseService.member.findMany({
      where: { workspaceId, userId: { in: userIds } },
    });

    if (existingMembers.length > 0) {
      throw new BadRequestException(
        'Some users are already members of this workspace',
      );
    }

    // Chuẩn bị dữ liệu để tạo mới thành viên
    const members: Prisma.MemberCreateManyInput[] = userIds.map((userId) => ({
      workspaceId,
      userId,
      role: RoleEnum.MEMBER,
    }));

    // Sử dụng transaction để đảm bảo toàn vẹn dữ liệu
    await this.databaseService.$transaction(async (prisma) => {
      await prisma.member.createMany({ data: members });
    });

    return { message: 'Members added successfully' };
  }
  private generateWorkspaceCode() {
    return Array.from(
      { length: 6 },
      () =>
        '0123456789abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 36)],
    ).join('');
  }
}
