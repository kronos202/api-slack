import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { logger } from './common/loggers/logger';
import { useContainer } from 'class-validator';
import helmet from 'helmet';
import compression from 'compression';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import validationOptions from './utils/validation-options';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './config/app/app-config.type';
import { getAppConfig } from './utils/helpers/getConfig';
import { swaggerEnvironments } from './common/constants/common.constant';
import { swaggerConfig } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: logger,
    }),
    abortOnError: false,
  });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Requested-With',
    ],
  });
  app.use(helmet());
  app.use(
    compression({
      level: 6, // Mức nén trung bình
      threshold: 1024, // Nén nếu phản hồi lớn hơn 1KB
      filter: (req, res) => {
        // Nén tất cả trừ khi header `x-no-compression` tồn tại
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
      chunkSize: 8192, // Kích thước chunk là 8KB
      zlib: {
        windowBits: 15, // Kích thước cửa sổ nén
        memLevel: 8, // Sử dụng bộ nhớ tối ưu
      },
    }),
  );

  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new PrismaClientExceptionFilter(),
  );
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  const configService = app.get(ConfigService<AppConfig>);
  const appConfig = getAppConfig(configService);

  app.enableShutdownHooks();
  app.setGlobalPrefix(appConfig.app.api_prefix, {
    exclude: ['/'],
  });

  if (swaggerEnvironments.includes(appConfig.app.node_env)) {
    swaggerConfig(app);
  }

  console.table({
    port: appConfig.app.app_port,
    name: appConfig.app.app_name,
    apiPrefix: appConfig.app.api_prefix,
  });
  await app.listen(appConfig.app.app_port);
}
void bootstrap();
