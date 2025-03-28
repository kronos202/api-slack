import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { UploadService } from 'src/upload/upload.service';
import { CloudinaryProvider } from 'src/upload/cloudinary.provider';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService, UploadService, CloudinaryProvider],
})
export class MessagesModule {}
