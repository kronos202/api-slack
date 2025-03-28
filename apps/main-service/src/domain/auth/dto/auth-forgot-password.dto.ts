import { IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AuthForgotPasswordDto {
  @Transform(lowerCaseTransformer)
  @ApiProperty({
    example: 'abcd123@gmail.com',
    description: 'email body',
  })
  @IsEmail()
  email: string;
}
