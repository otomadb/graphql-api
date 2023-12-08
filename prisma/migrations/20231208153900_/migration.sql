-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'ACCEPTING_BILIBILI_REGISTRATION_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE 'REJECTING_BILIBILI_REGISTRATION_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE 'ACCEPTING_SOUNDCLOUD_REGISTRATION_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE 'REJECTING_SOUNDCLOUD_REGISTRATION_REQUEST';
