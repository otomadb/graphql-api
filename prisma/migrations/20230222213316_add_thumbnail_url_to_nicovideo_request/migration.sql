/*
  Warnings:

  - Added the required column `thumbnailUrl` to the `NicovideoRegistrationRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NicovideoRegistrationRequest" ADD COLUMN     "thumbnailUrl" TEXT NOT NULL;
