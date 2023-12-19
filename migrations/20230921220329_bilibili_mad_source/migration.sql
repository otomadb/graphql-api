-- CreateTable
CREATE TABLE "BilibiliMADSource" (
    "id" TEXT NOT NULL,
    "sourceId" CITEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "videoId" TEXT NOT NULL,

    CONSTRAINT "BilibiliMADSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BilibiliMADSource_sourceId_key" ON "BilibiliMADSource"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "BilibiliMADSource_sourceId_videoId_key" ON "BilibiliMADSource"("sourceId", "videoId");

-- AddForeignKey
ALTER TABLE "BilibiliMADSource" ADD CONSTRAINT "BilibiliMADSource_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
