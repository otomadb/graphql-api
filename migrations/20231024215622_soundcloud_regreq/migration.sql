-- CreateEnum
CREATE TYPE "SoundcloudRegistrationRequestEventType" AS ENUM ('REQUEST', 'ACCEPT', 'REJECT');

-- CreateTable
CREATE TABLE "SoundcloudRegistrationRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestedById" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "isChecked" BOOLEAN NOT NULL,

    CONSTRAINT "SoundcloudRegistrationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoundcloudRegistrationRequestTagging" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "SoundcloudRegistrationRequestTagging_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoundcloudRegistrationRequestSemitagging" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "SoundcloudRegistrationRequestSemitagging_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoundcloudRegistrationRequestChecking" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedById" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "videoId" TEXT,
    "note" TEXT,

    CONSTRAINT "SoundcloudRegistrationRequestChecking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoundcloudRegistrationRequestEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "type" "SoundcloudRegistrationRequestEventType" NOT NULL,
    "payload" JSONB,

    CONSTRAINT "SoundcloudRegistrationRequestEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SoundcloudRegistrationRequest_sourceId_key" ON "SoundcloudRegistrationRequest"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "SoundcloudRegistrationRequestChecking_requestId_key" ON "SoundcloudRegistrationRequestChecking"("requestId");

-- AddForeignKey
ALTER TABLE "SoundcloudRegistrationRequest" ADD CONSTRAINT "SoundcloudRegistrationRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoundcloudRegistrationRequestTagging" ADD CONSTRAINT "SoundcloudRegistrationRequestTagging_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SoundcloudRegistrationRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoundcloudRegistrationRequestTagging" ADD CONSTRAINT "SoundcloudRegistrationRequestTagging_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoundcloudRegistrationRequestSemitagging" ADD CONSTRAINT "SoundcloudRegistrationRequestSemitagging_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SoundcloudRegistrationRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoundcloudRegistrationRequestChecking" ADD CONSTRAINT "SoundcloudRegistrationRequestChecking_checkedById_fkey" FOREIGN KEY ("checkedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoundcloudRegistrationRequestChecking" ADD CONSTRAINT "SoundcloudRegistrationRequestChecking_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SoundcloudRegistrationRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoundcloudRegistrationRequestChecking" ADD CONSTRAINT "SoundcloudRegistrationRequestChecking_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoundcloudRegistrationRequestEvent" ADD CONSTRAINT "SoundcloudRegistrationRequestEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoundcloudRegistrationRequestEvent" ADD CONSTRAINT "SoundcloudRegistrationRequestEvent_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SoundcloudRegistrationRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
