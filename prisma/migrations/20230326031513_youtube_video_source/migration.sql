-- CreateEnum
CREATE TYPE "YoutubeVideoSourceEventType" AS ENUM ('CREATE');

-- CreateTable
CREATE TABLE "YoutubeVideoSource" (
    "id" TEXT NOT NULL,
    "sourceId" CITEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "videoId" TEXT NOT NULL,

    CONSTRAINT "YoutubeVideoSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YoutubeVideoSourceEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "type" "YoutubeVideoSourceEventType" NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "YoutubeVideoSourceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeVideoSource_sourceId_key" ON "YoutubeVideoSource"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeVideoSource_sourceId_videoId_key" ON "YoutubeVideoSource"("sourceId", "videoId");

-- AddForeignKey
ALTER TABLE "YoutubeVideoSource" ADD CONSTRAINT "YoutubeVideoSource_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YoutubeVideoSourceEvent" ADD CONSTRAINT "YoutubeVideoSourceEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YoutubeVideoSourceEvent" ADD CONSTRAINT "YoutubeVideoSourceEvent_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "YoutubeVideoSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
