import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}
