import { registerAs } from '@nestjs/config';

import { IsString } from 'class-validator';
import validateConfig from 'src/utils/validate-config';
import { AuthConfig } from './auth-config.types';

class EnvironmentVariablesValidator {
  @IsString()
  ACCESS_SECRET_KEY: string;

  @IsString()
  ACCESS_EXPIRES_TIME: string;

  @IsString()
  REFRESH_SECRET_KEY: string;

  @IsString()
  REFRESH_EXPIRES_TIME: string;

  @IsString()
  CONFIRM_EMAIL_SECRET: string;

  @IsString()
  CONFIRM_EMAIL_EXPIRES: string;

  @IsString()
  FORGOT_PASSWORD_EXPIRES: string;

  @IsString()
  FORGOT_PASSWORD_SECRET: string;
}

export default registerAs<AuthConfig>('auth', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    access_secret_key: process.env.ACCESS_SECRET_KEY as string,
    access_expires_time: process.env.ACCESS_EXPIRES_TIME as string,
    refresh_secret_key: process.env.REFRESH_SECRET_KEY as string,
    refresh_expires_time: process.env.REFRESH_EXPIRES_TIME as string,
    confirm_email_secret: process.env.CONFIRM_EMAIL_SECRET as string,
    confirm_email_expires: process.env.CONFIRM_EMAIL_EXPIRES as string,
    forgot_password_expires: process.env.FORGOT_PASSWORD_EXPIRES as string,
    forgot_password_secret: process.env.FORGOT_PASSWORD_SECRET as string,
  };
});
