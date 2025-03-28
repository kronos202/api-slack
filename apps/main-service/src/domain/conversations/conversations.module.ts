import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { MembersService } from '../members/members.service';

@Module({
  imports: [],
  controllers: [ConversationsController],
  providers: [ConversationsService, MembersService],
})
export class ConversationsModule {}
