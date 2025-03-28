import { IsNotEmpty, IsString } from 'class-validator';

export class JoinWorkspaceDto {
  @IsNotEmpty()
  @IsString()
  joinCode: string;
}
