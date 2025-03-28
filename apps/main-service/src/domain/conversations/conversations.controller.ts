import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { AddRemoveParticipantDto } from './dto/add-remove-participant.dto';
import { AuthUser } from 'src/common/interfaces/user.interface';
import { CurrentUser } from 'src/common/decorators/user.decorator';

@Controller('/workspaces/:workspaceId/conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  create(
    @Body() createConversationDto: CreateConversationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.conversationsService.create(createConversationDto, user.id);
  }

  @Get()
  findAll(@Param('workspaceId') workspaceId: string) {
    return this.conversationsService.findAll(workspaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conversationsService.findOne(id);
  }

  @Post('/:conversationId/add-participant')
  addParticipant(
    @Body() addRemoveParticipantDto: AddRemoveParticipantDto,
    @Param('conversationId') conversationId: string,
  ) {
    return this.conversationsService.addParticipant(
      addRemoveParticipantDto,
      conversationId,
    );
  }

  @Patch('/:conversationId/remove-participant')
  removeParticipant(
    @Body() addRemoveParticipantDto: AddRemoveParticipantDto,
    conversationId: string,
  ) {
    return this.conversationsService.addParticipant(
      addRemoveParticipantDto,
      conversationId,
    );
  }

  @Delete(':conversationId')
  remove(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.conversationsService.remove(
      conversationId,
      user.id,
      workspaceId,
    );
  }
}
