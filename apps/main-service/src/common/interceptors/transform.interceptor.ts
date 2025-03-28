import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IResponse } from '../interfaces/response.interface';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, IResponse> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IResponse | any> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((res) => {
        if (!res) return {};
        const { code } = res;
        return {
          success: true,
          code: code || response.statusCode,
          data: res,
        } as IResponse;
      }),
    );
  }
}
