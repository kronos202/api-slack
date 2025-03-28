import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class TokenResponseDto {
  @IsString()
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOjM4LCJoYXNoIjoiYjgxM2EwNTU0OGY0MGI0YzEwMjMwYzE1MDA4Mzg0OWI0NWQwOTU5YzlmYTM2MmQ0YzFjOGNlZWMyYmRiYzdmYiIsImlhdCI6MTczNTAyNzc5OSwiZXhwIjoxNzM3NjE5Nzk5fQ.nr2z1z0p49O4dfKkpb81zhsIgGW46wczFPJvX7X8k3Q',
    description: 'Access token',
  })
  token: string;

  @IsString()
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtNTFkYWxtbTAwMDB1a3V3YWN4N3c1NDYiLCJyb2xlcyI6WyJ1c2VyIl0sInNlc3Npb25JZCI6MzgsInBlcm1pc3Npb25zIjpbeyJtZXRob2QiOiJHRVQiLCJwYXRoIjoiL3VzZXJzIn0seyJtZXRob2QiOiJQT1NUIiwicGF0aCI6Ii9hdXRoIn1dLCJpYXQiOjE3MzUwMjc3OTksImV4cCI6MTczNTYzMjU5OX0.kjcduBvILIv-r0AYJ-gHkGKW_nMh_IJYIwwH4SQQ3Ns',
    description: 'Refresh token',
  })
  refreshToken: string;

  @IsNumber()
  @ApiProperty({
    example: 1735632599895,
    description: 'Token expires in',
  })
  tokenExpires: number;
}
