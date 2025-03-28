/*
  Warnings:

  - Made the column `avatar` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user" ALTER COLUMN "avatar" SET NOT NULL,
ALTER COLUMN "deleted_at" SET DEFAULT null;
