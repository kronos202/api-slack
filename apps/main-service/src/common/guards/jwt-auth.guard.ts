import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC } from '../decorators/public.decorator';
import { SKIP_GLOBAL_JWT_GUARD } from '../decorators/ignore-global-jwt.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    // Bỏ qua guard cho các endpoint cụ thể
    const isIgnore = this.reflector.getAllAndOverride<boolean>(
      SKIP_GLOBAL_JWT_GUARD,
      [context.getHandler(), context.getClass()],
    );
    if (isIgnore) {
      return true;
    }

    return super.canActivate(context) as boolean;
  }
}
