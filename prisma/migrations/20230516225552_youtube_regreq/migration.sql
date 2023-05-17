-- CreateEnum
CREATE TYPE "YoutubeRegistrationRequestEventType" AS ENUM ('REQUEST', 'ACCEPT', 'REJECT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'ACCEPTING_YOUTUBE_REGISTRATION_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE 'REJECTING_YOUTUBE_REGISTRATION_REQUEST';

-- CreateTable
CREATE TABLE "YoutubeRegistrationRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestedById" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "isChecked" BOOLEAN NOT NULL,

    CONSTRAINT "YoutubeRegistrationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YoutubeRegistrationRequestTagging" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "YoutubeRegistrationRequestTagging_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YoutubeRegistrationRequestSemitagging" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "YoutubeRegistrationRequestSemitagging_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YoutubeRegistrationRequestChecking" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedById" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "videoId" TEXT,
    "note" TEXT,

    CONSTRAINT "YoutubeRegistrationRequestChecking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YoutubeRegistrationRequestEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "type" "YoutubeRegistrationRequestEventType" NOT NULL,
    "payload" JSONB,

    CONSTRAINT "YoutubeRegistrationRequestEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeRegistrationRequest_sourceId_key" ON "YoutubeRegistrationRequest"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeRegistrationRequestChecking_requestId_key" ON "YoutubeRegistrationRequestChecking"("requestId");

-- AddForeignKey
ALTER TABLE "YoutubeRegistrationRequest" ADD CONSTRAINT "YoutubeRegistrationRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YoutubeRegistrationRequestTagging" ADD CONSTRAINT "YoutubeRegistrationRequestTagging_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "YoutubeRegistrationRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YoutubeRegistrationRequestTagging" ADD CONSTRAINT "YoutubeRegistrationRequestTagging_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YoutubeRegistrationRequestSemitagging" ADD CONSTRAINT "YoutubeRegistrationRequestSemitagging_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "YoutubeRegistrationRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YoutubeRegistrationRequestChecking" ADD CONSTRAINT "YoutubeRegistrationRequestChecking_checkedById_fkey" FOREIGN KEY ("checkedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YoutubeRegistrationRequestChecking" ADD CONSTRAINT "YoutubeRegistrationRequestChecking_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "YoutubeRegistrationRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YoutubeRegistrationRequestChecking" ADD CONSTRAINT "YoutubeRegistrationRequestChecking_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YoutubeRegistrationRequestEvent" ADD CONSTRAINT "YoutubeRegistrationRequestEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YoutubeRegistrationRequestEvent" ADD CONSTRAINT "YoutubeRegistrationRequestEvent_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "YoutubeRegistrationRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
