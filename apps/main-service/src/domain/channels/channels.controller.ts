import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { AuthUser } from 'src/common/interfaces/user.interface';

@Controller('workspaces/:workspaceId/channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  // create channel
  @Post()
  async createChannel(
    @Body() createChannelDto: CreateChannelDto,
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.channelsService.createChannel(
      createChannelDto,
      user.id,
      workspaceId,
    );
  }

  @Patch(':channelId')
  async updateChannel(
    @Body() updateChannelDto: UpdateChannelDto,
    @Param('channelId') channelId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.channelsService.updateChannel(
      updateChannelDto,
      user.id,
      channelId,
    );
  }

  @Delete(':channelId')
  async removeChannel(
    @Param('channelId') channelId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.channelsService.removeChannel(user.id, channelId);
  }

  @Get()
  async getChannels(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.channelsService.getChannelsByWorkspace(user.id, workspaceId);
  }

  @Get(':channelId')
  async getChannelById(
    @Param('channelId') channelId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.channelsService.getChannelById(user.id, channelId);
  }
}
