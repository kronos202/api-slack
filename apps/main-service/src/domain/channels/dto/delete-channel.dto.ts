import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteChannelDto {
  @IsString()
  @IsNotEmpty()
  channelId: string;
}
