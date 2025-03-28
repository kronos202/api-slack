import { Session } from '@prisma/client';

export type JwtRefreshPayloadType = {
  sessionId: Session['id'];
  hash: Session['hash'];
  iat: number;
  exp: number;
};
