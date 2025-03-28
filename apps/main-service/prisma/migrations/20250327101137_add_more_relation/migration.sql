/*
  Warnings:

  - You are about to drop the `_ChannelToMember` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ChannelToMember" DROP CONSTRAINT "_ChannelToMember_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChannelToMember" DROP CONSTRAINT "_ChannelToMember_B_fkey";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "deleted_at" SET DEFAULT null;

-- DropTable
DROP TABLE "_ChannelToMember";

-- CreateTable
CREATE TABLE "member_channel" (
    "memberId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,

    CONSTRAINT "member_channel_pkey" PRIMARY KEY ("memberId","channelId")
);

-- AddForeignKey
ALTER TABLE "member_channel" ADD CONSTRAINT "member_channel_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_channel" ADD CONSTRAINT "member_channel_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
