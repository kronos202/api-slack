import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { RoleEnum } from 'src/common/enums/role.enum';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { AuthUser } from 'src/common/interfaces/user.interface';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get(':memberId')
  async getMemberById(@Param('memberId') memberId: string, @Request() request) {
    return this.membersService.getMemberById(memberId, request.user.id);
  }

  @Get('workspaces/:workspaceId/members')
  async getMembersByWorkspace(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.membersService.getMembers(workspaceId, user.id);
  }

  @Patch(':memberId')
  async updateMemberRole(
    @Param('memberId') memberId: string,
    @Body('role') role: RoleEnum,
    @CurrentUser() user: AuthUser,
  ) {
    return this.membersService.updateMemberRole(memberId, role, user.id);
  }

  @Delete(':memberId')
  async removeMember(
    @Param('memberId') memberId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.membersService.removeMember(memberId, user.id);
  }
}
