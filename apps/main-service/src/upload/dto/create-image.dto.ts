import { IsNotEmpty, IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateImageDto {
  @IsNotEmpty()
  @IsString()
  messageId: string; // ID của tin nhắn

  @IsNotEmpty()
  @IsString()
  userId: string; // ID của người dùng tải hình ảnh lên

  @IsNotEmpty()
  @IsUrl()
  imageUrl: string; // URL hình ảnh

  @IsOptional()
  metadata?: any; // Dữ liệu bổ sung về hình ảnh (ví dụ: định dạng, kích thước, vv)
}
