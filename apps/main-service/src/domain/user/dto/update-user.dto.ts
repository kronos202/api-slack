import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';

export class UpdateUserDto {
  @Transform(lowerCaseTransformer)
  @IsOptional()
  @IsEmail()
  @IsString()
  email?: string;

  @MinLength(6)
  @IsString()
  @IsOptional()
  password?: string | null;

  @MinLength(6)
  @IsString()
  @IsOptional()
  oldPassword?: string | null;

  @IsString()
  @IsOptional()
  @MinLength(3)
  username?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  firstName?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  lastName?: string;

  @IsOptional()
  bio?: string | null;

  @IsOptional()
  avatar?: string;

  @IsOptional()
  active?: boolean;

  @IsOptional()
  deletedAt?: Date | null;
}
