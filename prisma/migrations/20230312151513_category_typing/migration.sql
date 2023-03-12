-- CreateEnum
CREATE TYPE "CategoryTagType" AS ENUM ('COPYRIGHT', 'CHARACTER', 'SERIES', 'MUSIC', 'TACTICS', 'EVENT', 'PHRASE', 'STYLE');

-- CreateTable
CREATE TABLE "CategoryTagTyping" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "type" "CategoryTagType" NOT NULL,

    CONSTRAINT "CategoryTagTyping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoryTagTyping_tagId_key" ON "CategoryTagTyping"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryTagTyping_type_key" ON "CategoryTagTyping"("type");

-- AddForeignKey
ALTER TABLE "CategoryTagTyping" ADD CONSTRAINT "CategoryTagTyping_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryTagTyping" ADD CONSTRAINT "CategoryTagTyping_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
