import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';
import { Match } from 'src/common/decorators/match.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthRegisterLoginDto {
  @ApiProperty({
    example: 'kronosss2002@gmail.com',
    description: 'Email của người dùng',
  })
  @Transform(lowerCaseTransformer)
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    example: 'loveyun2@2',
    description: 'Mật khẩu của người dùng',
  })
  @MinLength(6, { message: 'Mật khẩu cần ít nhất 6 ký tự' })
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{};':"\\|,.<>/?]).{6,}$/,
    {
      message:
        'Mật khẩu cần ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số',
    },
  )
  password: string;

  @ApiProperty({
    example: 'loveyun2@2',
    description: 'Mật khẩu của người dùng',
  })
  @MinLength(6, { message: 'Mật khẩu cần ít nhất 6 ký tự' })
  @IsString()
  @Match('password', { message: 'Mật khẩu xác nhận không khớp' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{};':"\\|,.<>/?]).{6,}$/,
    {
      message:
        'Mật khẩu cần ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số',
    },
  )
  @IsNotEmpty()
  confirmPassword: string;

  @ApiProperty({
    example: 'test',
    description: 'Biệt danh của người dùng',
  })
  @IsNotEmpty({ message: 'Tên người dùng không được để trống' })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'test',
    description: 'Tên của người dùng',
  })
  @IsNotEmpty({ message: 'Tên người dùng không được để trống' })
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'test',
    description: 'Họ của người dùng',
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;
}
