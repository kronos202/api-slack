import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';

export class CreateUserDto {
  @Transform(lowerCaseTransformer)
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  firstName?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  lastName?: string;

  @IsOptional()
  @MinLength(3)
  bio?: string | null;

  @IsOptional()
  avatar?: string;
}
