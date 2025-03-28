import { Session, User } from '@prisma/client';

export type JwtPayloadType = Pick<User, 'id'> & {
  sessionId: Session['id'];
  iat: number;
  exp: number;
};
