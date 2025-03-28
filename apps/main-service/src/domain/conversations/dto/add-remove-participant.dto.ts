// src/conversation/dto/add-participant.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class AddRemoveParticipantDto {
  @IsNotEmpty()
  @IsString()
  memberId: string;
}
