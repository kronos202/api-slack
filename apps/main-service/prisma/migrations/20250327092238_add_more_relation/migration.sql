-- AlterTable
ALTER TABLE "user" ALTER COLUMN "deleted_at" SET DEFAULT null;

-- CreateTable
CREATE TABLE "_ChannelToMember" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ChannelToMember_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ChannelToMember_B_index" ON "_ChannelToMember"("B");

-- AddForeignKey
ALTER TABLE "_ChannelToMember" ADD CONSTRAINT "_ChannelToMember_A_fkey" FOREIGN KEY ("A") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChannelToMember" ADD CONSTRAINT "_ChannelToMember_B_fkey" FOREIGN KEY ("B") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
