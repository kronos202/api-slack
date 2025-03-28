import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import * as _ from 'lodash';

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Giả định rằng status và message là cố định, bạn có thể điều chỉnh theo yêu cầu của bạn
        return this.removePassword(data);
      }),
    );
  }

  private removePassword<T>(data: T): T {
    if (_.isArray(data)) {
      return data.map((item) => this.removePassword(item)) as unknown as T;
    }
    if (_.isObject(data)) {
      _.unset(data, 'password');
      _.forEach(data, (value) => {
        if (_.isObject(value)) {
          this.removePassword(value);
        }
      });
      return data;
    }
    return data;
  }
}
