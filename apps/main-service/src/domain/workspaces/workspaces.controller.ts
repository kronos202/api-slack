import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { RoleGuard } from 'src/common/guards/role.guard';
import { RoleEnum } from 'src/common/enums/role.enum';
import { Roles } from 'src/common/decorators/role.decorator';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { AuthUser } from 'src/common/interfaces/user.interface';
import { JoinWorkspaceDto } from './dto/join-workspace.dto';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post('join')
  async joinWorkspace(
    @Body() joinWorkspaceDto: JoinWorkspaceDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workspacesService.joinWorkspace(
      user.id,
      joinWorkspaceDto.joinCode,
    );
  }

  @Post('/:workspaceId/new-join-code')
  async newJoinCode(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workspacesService.newJoinCode(user.id, workspaceId);
  }

  @Post('create')
  async createWorkspace(
    @Body() body: CreateWorkspaceDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workspacesService.createWorkspace(user.id, body.name);
  }

  @Get('get')
  async getWorkspaces(@CurrentUser() user: AuthUser) {
    return this.workspacesService.getWorkspaces(user.id);
  }

  @Get(':workspaceId/info')
  async getWorkspaceInfoById(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workspacesService.getWorkspaceInfoById(user.id, workspaceId);
  }

  @Patch(':workspaceId/update')
  @Roles(RoleEnum.ADMIN) // Chỉ owner có thể chuyển quyền sở hữu
  @UseGuards(RoleGuard)
  async updateWorkspace(
    @Body() body: UpdateWorkspaceDto,
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workspacesService.updateWorkspace(
      user.id,
      workspaceId,
      body.name,
    );
  }

  @Delete(':workspaceId/remove')
  @Roles(RoleEnum.ADMIN) // Chỉ owner có thể chuyển quyền sở hữu
  @UseGuards(RoleGuard)
  async removeWorkspace(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workspacesService.removeWorkspace(user.id, workspaceId);
  }

  @Get(':workspaceId/members')
  async getMembers(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workspacesService.getMembers(workspaceId, user.id);
  }

  @Post(':workspaceId/leave')
  async leaveWorkspace(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workspacesService.leaveWorkspace(user.id, workspaceId);
  }

  @Post(':workspaceId/leave')
  @Roles(RoleEnum.ADMIN) // Chỉ owner có thể chuyển quyền sở hữu
  @UseGuards(RoleGuard)
  async transferAdminRole(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: AuthUser,
    @Body() body: { newUserId: string },
  ) {
    return this.workspacesService.transferAdminRole(
      user.id,
      workspaceId,
      body.newUserId,
    );
  }

  @Post(':workspaceId/add')
  @UseGuards(RoleGuard)
  async addMembers(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: AuthUser,
    @Body() body: { newUserId: string[] },
  ) {
    return this.workspacesService.addMembers(
      workspaceId,
      user.id,
      body.newUserId,
    );
  }
}
