import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AuthEmailLoginDto {
  @ApiProperty({
    example: 'kronosss2002@gmail.com',
    description: 'Email của người dùng',
  })
  @Transform(lowerCaseTransformer)
  @IsEmail()
  @IsNotEmpty({ message: 'Thiếu email' })
  email: string;

  @ApiProperty({
    example: 'loveyun2@2',
    description: 'Mật khẩu của người dùng',
  })
  @IsNotEmpty({ message: 'Thiếu password' })
  @IsString()
  password: string;
}
