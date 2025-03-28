import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { RedisService } from './common/services/redis.service';
import { Public } from './common/decorators/public.decorator';

@Controller('app')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  @Public()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('check-redis')
  @Public()
  async checkRedisConnection(): Promise<string> {
    return this.redisService.checkConnection();
  }
}
