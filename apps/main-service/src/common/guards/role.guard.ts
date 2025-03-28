import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { RoleEnum } from '../enums/role.enum';
import { Reflector } from '@nestjs/core';
import { DatabaseService } from 'src/database/database.service';
import { Roles } from '../decorators/role.decorator';

// Sử dụng metadata để gắn role cho route
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id; // Lấy user từ middleware AuthGuard.
    const workspaceId =
      request.body.workspaceId ||
      request.query.workspaceId ||
      request.params.workspaceId;

    if (!userId || !workspaceId) {
      throw new ForbiddenException(
        'Missing user authentication or workspace ID',
      );
    }

    // Lấy vai trò cần kiểm tra từ metadata (gắn tại route handler)
    const requiredRoles = this.reflector.get<RoleEnum[]>(
      Roles,
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      // Nếu route không yêu cầu vai trò, cho phép truy cập
      return true;
    }

    // Lấy thông tin thành viên từ database
    const member = await this.databaseService.member.findUnique({
      where: {
        userId_workspaceId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('Access Denied');
    }

    // Xác định vai trò hiện tại
    const rolesHierarchy = [
      RoleEnum.GUEST,
      RoleEnum.MEMBER,
      RoleEnum.ADMIN,
      RoleEnum.OWNER,
    ];
    const memberRoleIndex = rolesHierarchy.indexOf(member.role as RoleEnum);
    const highestRequiredRoleIndex = Math.min(
      ...requiredRoles.map((role) => rolesHierarchy.indexOf(role)),
    );

    // Kiểm tra quyền
    if (memberRoleIndex < highestRequiredRoleIndex) {
      throw new ForbiddenException(
        `Insufficient permissions to access this resource`,
      );
    }

    return true;
  }
}
