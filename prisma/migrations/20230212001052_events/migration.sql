/*
  Warnings:

  - You are about to drop the column `tagId` on the `Semitag` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TagEventType" AS ENUM ('CREATED');

-- CreateEnum
CREATE TYPE "TagNameEventType" AS ENUM ('CREATED');

-- CreateEnum
CREATE TYPE "TagParentEventType" AS ENUM ('CREATED');

-- CreateEnum
CREATE TYPE "VideoTitleEventType" AS ENUM ('CREATED', 'SET_PRIMARY', 'UNSET_PRIMARY');

-- CreateEnum
CREATE TYPE "VideoThumbnailEventType" AS ENUM ('CREATED', 'SET_PRIMARY', 'UNSET_PRIMARY');

-- CreateEnum
CREATE TYPE "VideoTagEventType" AS ENUM ('CREATED');

-- CreateEnum
CREATE TYPE "SemitagEventType" AS ENUM ('CREATED', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NicovideoVideoSourceEventType" AS ENUM ('CREATED');

-- DropForeignKey
ALTER TABLE "Semitag" DROP CONSTRAINT "Semitag_tagId_fkey";

-- AlterTable
ALTER TABLE "Semitag" DROP COLUMN "tagId",
ADD COLUMN     "videoTagId" TEXT;

-- CreateTable
CREATE TABLE "TagEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "type" "VideoEventType" NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "TagEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagNameEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "tagNameId" TEXT NOT NULL,
    "type" "TagNameEventType" NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "TagNameEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagParentEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "type" "TagParentEventType" NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "TagParentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoTitleEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "videoTitleId" TEXT NOT NULL,
    "type" "VideoTitleEventType" NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "VideoTitleEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoThumbnailEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "videoThumbnailId" TEXT NOT NULL,
    "type" "VideoThumbnailEventType" NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "VideoThumbnailEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoTagEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "videoTagId" TEXT NOT NULL,
    "type" "VideoTagEventType" NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "VideoTagEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SemitagEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "semitagId" TEXT NOT NULL,
    "type" "SemitagEventType" NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "SemitagEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NicovideoVideoSourceEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "type" "NicovideoVideoSourceEventType" NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "NicovideoVideoSourceEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TagEvent" ADD CONSTRAINT "TagEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagEvent" ADD CONSTRAINT "TagEvent_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagNameEvent" ADD CONSTRAINT "TagNameEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagNameEvent" ADD CONSTRAINT "TagNameEvent_tagNameId_fkey" FOREIGN KEY ("tagNameId") REFERENCES "TagName"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagParentEvent" ADD CONSTRAINT "TagParentEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoTitleEvent" ADD CONSTRAINT "VideoTitleEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoTitleEvent" ADD CONSTRAINT "VideoTitleEvent_videoTitleId_fkey" FOREIGN KEY ("videoTitleId") REFERENCES "VideoTitle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoThumbnailEvent" ADD CONSTRAINT "VideoThumbnailEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoThumbnailEvent" ADD CONSTRAINT "VideoThumbnailEvent_videoThumbnailId_fkey" FOREIGN KEY ("videoThumbnailId") REFERENCES "VideoThumbnail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoTagEvent" ADD CONSTRAINT "VideoTagEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoTagEvent" ADD CONSTRAINT "VideoTagEvent_videoTagId_fkey" FOREIGN KEY ("videoTagId") REFERENCES "VideoTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Semitag" ADD CONSTRAINT "Semitag_videoTagId_fkey" FOREIGN KEY ("videoTagId") REFERENCES "VideoTag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemitagEvent" ADD CONSTRAINT "SemitagEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemitagEvent" ADD CONSTRAINT "SemitagEvent_semitagId_fkey" FOREIGN KEY ("semitagId") REFERENCES "Semitag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NicovideoVideoSourceEvent" ADD CONSTRAINT "NicovideoVideoSourceEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NicovideoVideoSourceEvent" ADD CONSTRAINT "NicovideoVideoSourceEvent_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "NicovideoVideoSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
