-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'RESOLVING_YOUTUBE_REGISTRATION_REQUEST';

-- AlterEnum
ALTER TYPE "YoutubeRegistrationRequestEventType" ADD VALUE 'RESOLVE';

-- DropIndex
DROP INDEX "YoutubeVideoSource_sourceId_videoId_key";

-- AlterTable
ALTER TABLE "YoutubeRegistrationRequestChecking" ADD COLUMN     "videoSourceId" TEXT;

-- AddForeignKey
ALTER TABLE "YoutubeRegistrationRequestChecking" ADD CONSTRAINT "YoutubeRegistrationRequestChecking_videoSourceId_fkey" FOREIGN KEY ("videoSourceId") REFERENCES "YoutubeVideoSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
