-- CreateEnum
CREATE TYPE "BilibiliMADSourceEventType" AS ENUM ('CREATE');

-- CreateTable
CREATE TABLE "BilibiliMADSourceEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "type" "BilibiliMADSourceEventType" NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "BilibiliMADSourceEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BilibiliMADSourceEvent" ADD CONSTRAINT "BilibiliMADSourceEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BilibiliMADSourceEvent" ADD CONSTRAINT "BilibiliMADSourceEvent_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "BilibiliMADSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
