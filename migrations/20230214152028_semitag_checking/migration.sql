/*
  Warnings:

  - You are about to drop the column `videoTagId` on the `Semitag` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Semitag" DROP CONSTRAINT "Semitag_videoTagId_fkey";

-- AlterTable
ALTER TABLE "Semitag" DROP COLUMN "videoTagId";

-- CreateTable
CREATE TABLE "SemitagChecking" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "semitagId" TEXT NOT NULL,
    "videoTagId" TEXT,

    CONSTRAINT "SemitagChecking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SemitagChecking_semitagId_key" ON "SemitagChecking"("semitagId");

-- AddForeignKey
ALTER TABLE "SemitagChecking" ADD CONSTRAINT "SemitagChecking_semitagId_fkey" FOREIGN KEY ("semitagId") REFERENCES "Semitag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemitagChecking" ADD CONSTRAINT "SemitagChecking_videoTagId_fkey" FOREIGN KEY ("videoTagId") REFERENCES "VideoTag"("id") ON DELETE SET NULL ON UPDATE CASCADE;
