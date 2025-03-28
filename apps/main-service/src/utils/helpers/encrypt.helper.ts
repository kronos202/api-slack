import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export class EncryptHelper {
  static hash(str: string, saltRounds = 10): string {
    return bcrypt.hashSync(str, saltRounds);
  }

  static compare(str: string, hash: string): boolean {
    return bcrypt.compareSync(str, hash);
  }

  static genSha256(): string {
    return crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');
  }
}
