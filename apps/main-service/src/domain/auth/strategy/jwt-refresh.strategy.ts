import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtRefreshPayloadType } from './types/jwt-refresh-payload.type';
import { AuthConfig } from 'src/config/auth/auth-config.types';
import { OrNeverType } from 'src/utils/types/or-never.type';
import { getAuthConfig } from 'src/utils/helpers/getConfig';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService<AuthConfig>) {
    const authConfig = getAuthConfig(configService);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: authConfig.refresh_secret_key,
      ignoreExpiration: false,
      // passReqToCallback: true,
    });
  }

  public validate(
    payload: JwtRefreshPayloadType,
  ): OrNeverType<JwtRefreshPayloadType> {
    if (!payload.sessionId) {
      throw new UnauthorizedException('invalid session id');
    }

    return payload;
  }
}
