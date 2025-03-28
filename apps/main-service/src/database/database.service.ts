import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { AppConfig } from 'src/config/app/app-config.type';
import { getAppConfig } from 'src/utils/helpers/getConfig';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  constructor(configService: ConfigService<AppConfig>) {
    const config = getAppConfig(configService);
    const databaseUrl = `postgresql://${config.app.database_username}:${config.app.database_password}@${config.app.database_host}:${config.app.database_port}/${config.app.database_name}?schema=public`;
    super({
      datasources: {
        db: {
          url: `${databaseUrl}`,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Database connected successfully!.');
  }
}
