-- CreateTable
CREATE TABLE "NicovideoRegistrationRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestedById" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isChecked" BOOLEAN NOT NULL,

    CONSTRAINT "NicovideoRegistrationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NicovideoRegistrationRequestTagging" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "NicovideoRegistrationRequestTagging_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NicovideoRegistrationRequestSemitagging" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "NicovideoRegistrationRequestSemitagging_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NicovideoRegistrationRequestChecking" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedById" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "videoId" TEXT,
    "note" TEXT,

    CONSTRAINT "NicovideoRegistrationRequestChecking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NicovideoRegistrationRequest_sourceId_key" ON "NicovideoRegistrationRequest"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "NicovideoRegistrationRequestChecking_requestId_key" ON "NicovideoRegistrationRequestChecking"("requestId");

-- AddForeignKey
ALTER TABLE "NicovideoRegistrationRequest" ADD CONSTRAINT "NicovideoRegistrationRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NicovideoRegistrationRequestTagging" ADD CONSTRAINT "NicovideoRegistrationRequestTagging_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "NicovideoRegistrationRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NicovideoRegistrationRequestTagging" ADD CONSTRAINT "NicovideoRegistrationRequestTagging_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NicovideoRegistrationRequestSemitagging" ADD CONSTRAINT "NicovideoRegistrationRequestSemitagging_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "NicovideoRegistrationRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NicovideoRegistrationRequestChecking" ADD CONSTRAINT "NicovideoRegistrationRequestChecking_checkedById_fkey" FOREIGN KEY ("checkedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NicovideoRegistrationRequestChecking" ADD CONSTRAINT "NicovideoRegistrationRequestChecking_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "NicovideoRegistrationRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NicovideoRegistrationRequestChecking" ADD CONSTRAINT "NicovideoRegistrationRequestChecking_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;
