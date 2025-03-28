// src/conversation/dto/create-conversation.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsNotEmpty()
  @IsString()
  workspaceId: string;

  @IsNotEmpty()
  @IsString({ each: true })
  participantIds: string[];
}
