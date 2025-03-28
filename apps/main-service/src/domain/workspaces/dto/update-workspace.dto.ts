import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateWorkspaceDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
