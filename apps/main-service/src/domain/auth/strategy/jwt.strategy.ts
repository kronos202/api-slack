import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadType } from './types/jwt-payload.type';
import { AuthConfig } from 'src/config/auth/auth-config.types';
import { OrNeverType } from 'src/utils/types/or-never.type';
import { getAuthConfig } from 'src/utils/helpers/getConfig';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService<AuthConfig>) {
    const authConfig = getAuthConfig(configService);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: authConfig.access_secret_key,
      ignoreExpiration: false,
    });
  }

  public validate(payload: JwtPayloadType): OrNeverType<JwtPayloadType> {
    console.log('log here');

    if (!payload.id) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
