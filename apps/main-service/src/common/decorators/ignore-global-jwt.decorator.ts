import { SetMetadata } from '@nestjs/common';

export const SKIP_GLOBAL_JWT_GUARD = 'SKIP_GLOBAL_JWT_GUARD';
export const IS_SKIP_GLOBAL_JWT_GUARD = () =>
  SetMetadata(SKIP_GLOBAL_JWT_GUARD, true);
