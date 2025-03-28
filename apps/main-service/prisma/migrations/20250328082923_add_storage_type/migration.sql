-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('AVATAR', 'MESSAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "StorageType" AS ENUM ('LOCAL', 'CLOUDINARY');

-- AlterTable
ALTER TABLE "image" ADD COLUMN     "cloudinaryId" TEXT,
ADD COLUMN     "storageType" "StorageType" NOT NULL DEFAULT 'LOCAL',
ADD COLUMN     "type" "ImageType" NOT NULL DEFAULT 'AVATAR';

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "deleted_at" SET DEFAULT null;
