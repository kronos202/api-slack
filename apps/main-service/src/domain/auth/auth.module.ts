import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { SessionsService } from '../sessions/sessions.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtRefreshStrategy } from './strategy/jwt-refresh.strategy';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { BullModule } from '@nestjs/bull';
import { UserProcessor } from 'src/processors/user.processor';

@Module({
  imports: [
    JwtModule,
    PassportModule,
    BullBoardModule.forFeature({
      name: 'email-queue',
      adapter: BullAdapter, //or use BullAdapter if you're using bull instead of bullMQ
    }),
    BullModule.registerQueue({
      name: 'email-queue', // Đăng ký queue.
      redis: {
        host: 'localhost',
        port: 6379,
      },
      defaultJobOptions: {
        attempts: 10, // Number of retry attempts.
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtRefreshStrategy,
    AuthService,
    JwtService,
    UserService,
    SessionsService,
    LocalStrategy,
    JwtStrategy,
    UserProcessor,
  ],
})
export class AuthModule {}
