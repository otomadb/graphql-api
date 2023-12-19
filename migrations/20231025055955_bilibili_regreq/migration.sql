-- CreateEnum
CREATE TYPE "BilibiliRegistrationRequestEventType" AS ENUM ('REQUEST', 'ACCEPT', 'REJECT');

-- CreateTable
CREATE TABLE "BilibiliRegistrationRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestedById" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "isChecked" BOOLEAN NOT NULL,

    CONSTRAINT "BilibiliRegistrationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BilibiliRegistrationRequestTagging" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "BilibiliRegistrationRequestTagging_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BilibiliRegistrationRequestSemitagging" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "BilibiliRegistrationRequestSemitagging_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BilibiliRegistrationRequestChecking" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedById" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "videoId" TEXT,
    "note" TEXT,

    CONSTRAINT "BilibiliRegistrationRequestChecking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BilibiliRegistrationRequestEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "type" "BilibiliRegistrationRequestEventType" NOT NULL,
    "payload" JSONB,

    CONSTRAINT "BilibiliRegistrationRequestEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BilibiliRegistrationRequest_sourceId_key" ON "BilibiliRegistrationRequest"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "BilibiliRegistrationRequestChecking_requestId_key" ON "BilibiliRegistrationRequestChecking"("requestId");

-- AddForeignKey
ALTER TABLE "BilibiliRegistrationRequest" ADD CONSTRAINT "BilibiliRegistrationRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BilibiliRegistrationRequestTagging" ADD CONSTRAINT "BilibiliRegistrationRequestTagging_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "BilibiliRegistrationRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BilibiliRegistrationRequestTagging" ADD CONSTRAINT "BilibiliRegistrationRequestTagging_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BilibiliRegistrationRequestSemitagging" ADD CONSTRAINT "BilibiliRegistrationRequestSemitagging_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "BilibiliRegistrationRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BilibiliRegistrationRequestChecking" ADD CONSTRAINT "BilibiliRegistrationRequestChecking_checkedById_fkey" FOREIGN KEY ("checkedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BilibiliRegistrationRequestChecking" ADD CONSTRAINT "BilibiliRegistrationRequestChecking_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "BilibiliRegistrationRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BilibiliRegistrationRequestChecking" ADD CONSTRAINT "BilibiliRegistrationRequestChecking_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BilibiliRegistrationRequestEvent" ADD CONSTRAINT "BilibiliRegistrationRequestEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BilibiliRegistrationRequestEvent" ADD CONSTRAINT "BilibiliRegistrationRequestEvent_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "BilibiliRegistrationRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
