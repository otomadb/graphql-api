-- CreateEnum
CREATE TYPE "SoundcloudVideoSourceEventType" AS ENUM ('CREATE');

-- CreateTable
CREATE TABLE "SoundcloudVideoSource" (
    "id" TEXT NOT NULL,
    "sourceId" CITEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "videoId" TEXT NOT NULL,

    CONSTRAINT "SoundcloudVideoSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoundcloudVideoSourceEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "type" "SoundcloudVideoSourceEventType" NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "SoundcloudVideoSourceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SoundcloudVideoSource_sourceId_key" ON "SoundcloudVideoSource"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "SoundcloudVideoSource_sourceId_videoId_key" ON "SoundcloudVideoSource"("sourceId", "videoId");

-- AddForeignKey
ALTER TABLE "SoundcloudVideoSource" ADD CONSTRAINT "SoundcloudVideoSource_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoundcloudVideoSourceEvent" ADD CONSTRAINT "SoundcloudVideoSourceEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoundcloudVideoSourceEvent" ADD CONSTRAINT "SoundcloudVideoSourceEvent_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "SoundcloudVideoSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
