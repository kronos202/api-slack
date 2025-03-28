import { v2 as cloudinary } from 'cloudinary';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CloudinaryProvider {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Từ .env
      api_key: process.env.CLOUDINARY_API_KEY, // Từ .env
      api_secret: process.env.CLOUDINARY_API_SECRET, // Từ .env
    });
  }

  getInstance() {
    return cloudinary;
  }
}
