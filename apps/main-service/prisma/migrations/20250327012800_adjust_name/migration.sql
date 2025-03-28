/*
  Warnings:

  - You are about to drop the column `memberId` on the `workspace` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `workspace` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerId` to the `workspace` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "workspace" DROP CONSTRAINT "workspace_memberId_fkey";

-- DropIndex
DROP INDEX "workspace_memberId_id_key";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "deleted_at" SET DEFAULT null;

-- AlterTable
ALTER TABLE "workspace" DROP COLUMN "memberId",
ADD COLUMN     "ownerId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "workspace_id_key" ON "workspace"("id");

-- AddForeignKey
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
