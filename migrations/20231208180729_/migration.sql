/*
  Warnings:

  - Made the column `thumbnailUrl` on table `SoundcloudRegistrationRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SoundcloudRegistrationRequest" ALTER COLUMN "thumbnailUrl" SET NOT NULL;
