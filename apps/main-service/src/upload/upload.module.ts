import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { CloudinaryProvider } from './cloudinary.provider';
import { UploadController } from './upload.controller';

@Module({
  controllers: [UploadController],
  providers: [UploadService, CloudinaryProvider],
  exports: [CloudinaryProvider],
})
export class UploadModule {}
