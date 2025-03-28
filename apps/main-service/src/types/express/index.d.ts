// src/types/express/index.d.ts

import { Multer } from 'multer';
import { AuthUser } from 'src/common/interfaces/user.interface';

declare global {
  namespace Express {
    export interface Request {
      user: AuthUser;
      file: Multer.File | undefined; // Nếu bạn chỉ upload một file
      files: Multer.File[] | undefined; // Nếu bạn upload nhiều file
    }
  }
}
