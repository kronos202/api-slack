/*
  Warnings:

  - You are about to drop the column `memberId` on the `workspace` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "workspace" DROP CONSTRAINT "workspace_memberId_fkey";

-- DropIndex
DROP INDEX "workspace_memberId_id_key";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "deleted_at" SET DEFAULT null;

-- AlterTable
ALTER TABLE "workspace" DROP COLUMN "memberId";

-- CreateTable
CREATE TABLE "_UserToWorkspace" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserToWorkspace_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserToWorkspace_B_index" ON "_UserToWorkspace"("B");

-- AddForeignKey
ALTER TABLE "_UserToWorkspace" ADD CONSTRAINT "_UserToWorkspace_A_fkey" FOREIGN KEY ("A") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToWorkspace" ADD CONSTRAINT "_UserToWorkspace_B_fkey" FOREIGN KEY ("B") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
