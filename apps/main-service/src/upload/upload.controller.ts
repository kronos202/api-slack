import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { StorageType } from '@prisma/client';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('multiple')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, callback) => {
        if (!RegExp(/\/(jpg|jpeg|png|gif|webp)$/).exec(file.mimetype)) {
          return callback(new Error('File type not supported'), false);
        }
        callback(null, true);
      },
    }),
  ) // Tối đa 10 file
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[], // Mảng các file ảnh
    @Body('storageType') storageType: StorageType, // Kiểu lưu trữ (local hoặc cloudinary)
    @Body('userId') userId: string, // ID của người dùng
    @Body('messageId') messageId?: string, // ID tin nhắn (optional)
  ) {
    // Gọi service upload ảnh
    return this.uploadService.upload(files, storageType, userId, messageId);
  }
}
