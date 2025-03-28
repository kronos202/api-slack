import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, url, headers, query, body } = req;

    res.on('finish', () => {
      const responseTime = Date.now() - start;
      const message = `${method} ${url} ${res.statusCode} ${responseTime}ms`;
      const statusCode = res.statusCode;
      const logData = {
        responseTime,
        method,
        url,
        headers,
        query,
        body,
      };

      if (statusCode >= 500) {
        this.logger.error(message, undefined, `HTTP`, logData);
      } else if (statusCode >= 400) {
        this.logger.error(message, `HTTP`, logData);
      } else {
        this.logger.log(message, `HTTP`, logData);
      }
    });

    next();
  }
}
