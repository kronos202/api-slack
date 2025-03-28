import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { BaseService } from 'src/common/services/base.service';
import { Prisma, Session, User } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { NullableType } from 'src/utils/types/nullable';

@Injectable()
export class SessionsService extends BaseService<
  CreateSessionDto,
  UpdateSessionDto,
  Prisma.SessionWhereInput,
  Prisma.SessionSelect,
  Prisma.SessionInclude
> {
  constructor(protected databaseService: DatabaseService) {
    super(databaseService, 'Session');
  }
  async create(createSessionDto: CreateSessionDto) {
    return await super.create(createSessionDto);
  }

  async findSessionById(id: Session['id']): Promise<NullableType<Session>> {
    return await super.findUnique({
      where: { id },
    });
  }

  async updateSession(id: number, updateSessionDto: UpdateSessionDto) {
    return super.updateOrFailById(id, updateSessionDto);
  }

  async deleteById(id: number) {
    return super.delete({
      where: { id },
    });
  }

  async deleteAllSessionsByUserId(userId: User['id']) {
    return super.deleteMany({
      where: { userId },
    });
  }

  async deleteByUserIdWithExclude(
    userId: User['id'],
    excludeSessionId: Session['id'] | undefined,
  ) {
    return super.deleteMany({
      where: {
        userId,
        id: {
          not: excludeSessionId,
        },
      },
    });
  }
}
