import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';

export class AuthUpdateDto {
  @IsOptional()
  photo?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'mustBeNotEmpty' })
  firstName?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'mustBeNotEmpty' })
  lastName?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  @Transform(lowerCaseTransformer)
  email?: string;

  @IsOptional()
  @IsNotEmpty()
  @MinLength(6)
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'mustBeNotEmpty' })
  oldPassword?: string;
}
