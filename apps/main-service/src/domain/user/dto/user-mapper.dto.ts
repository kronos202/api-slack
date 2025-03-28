import { IsEmail, IsString } from 'class-validator';

export class UserMapperDto {
  @IsString()
  id: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  avatar: string;
}
