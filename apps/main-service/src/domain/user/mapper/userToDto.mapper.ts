import { UserResponseDto } from '../dto/user-response.dto';
import { UserMapperDto } from '../dto/user-mapper.dto';

export function mapUserToDto(user: UserMapperDto): UserResponseDto {
  return {
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    avatar: user.avatar,
  };
}
