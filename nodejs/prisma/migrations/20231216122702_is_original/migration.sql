-- AlterTable
ALTER TABLE "BilibiliMADSource" ADD COLUMN     "isOriginal" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "NicovideoVideoSource" ADD COLUMN     "isOriginal" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "SoundcloudVideoSource" ADD COLUMN     "isOriginal" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "YoutubeVideoSource" ADD COLUMN     "isOriginal" BOOLEAN NOT NULL DEFAULT true;
