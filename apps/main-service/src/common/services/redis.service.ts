import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly redis: Redis;

  constructor() {
    // Kết nối tới Redis
    this.redis = new Redis({
      host: 'localhost', // Hoặc host Redis của bạn
      port: 6379, // Cổng mặc định của Redis
      password: '', // Nếu có mật khẩu thì điền vào đây
    });
  }

  // Kiểm tra kết nối Redis
  async checkConnection(): Promise<string> {
    try {
      const response = await this.redis.ping();
      return `Redis is connected: ${response}`;
    } catch (error) {
      return `Error connecting to Redis: ${error.message}`;
    }
  }
}
