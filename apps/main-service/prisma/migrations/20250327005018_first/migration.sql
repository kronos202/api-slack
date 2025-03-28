/*
  Warnings:

  - You are about to drop the `_UserToWorkspace` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[memberId,id]` on the table `workspace` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `memberId` to the `workspace` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_UserToWorkspace" DROP CONSTRAINT "_UserToWorkspace_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserToWorkspace" DROP CONSTRAINT "_UserToWorkspace_B_fkey";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "deleted_at" SET DEFAULT null;

-- AlterTable
ALTER TABLE "workspace" ADD COLUMN     "memberId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_UserToWorkspace";

-- CreateIndex
CREATE UNIQUE INDEX "workspace_memberId_id_key" ON "workspace"("memberId", "id");

-- AddForeignKey
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
