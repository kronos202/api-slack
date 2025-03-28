import { IsOptional, IsString } from 'class-validator';

export class UpdateSessionDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  hash?: string;
}
