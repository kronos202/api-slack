export class CreateMessageDto {
  content: string;
  workspaceId: string;
  imageUrl?: string;
  channelId?: string;
  conversationId?: string;
  parentMessageId?: string;
}
