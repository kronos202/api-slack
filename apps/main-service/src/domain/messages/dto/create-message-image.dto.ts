import { IsOptional, IsString } from 'class-validator';

export class CreateMessageWithImagesDto {
  @IsString()
  workspaceId: string;
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  channelId?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsOptional()
  @IsString()
  parentMessageId?: string;
}
