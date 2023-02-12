-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "citext";

-- CreateEnum
CREATE TYPE "MylistShareRange" AS ENUM ('PUBLIC', 'KNOW_LINK', 'PRIVATE');

-- CreateEnum
CREATE TYPE "TagEventType" AS ENUM ('CREATED');

-- CreateEnum
CREATE TYPE "TagNameEventType" AS ENUM ('CREATED', 'SET_PRIMARY', 'UNSET_PRIMARY');

-- CreateEnum
CREATE TYPE "TagParentEventType" AS ENUM ('CREATED', 'SET_PRIMARY', 'UNSET_PRIMARY');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('NORMAL', 'EDITOR', 'ADMINISTRATOR');

-- CreateEnum
CREATE TYPE "VideoEventType" AS ENUM ('REGISTER');

-- CreateEnum
CREATE TYPE "VideoTitleEventType" AS ENUM ('CREATED', 'SET_PRIMARY', 'UNSET_PRIMARY');

-- CreateEnum
CREATE TYPE "VideoThumbnailEventType" AS ENUM ('CREATED', 'SET_PRIMARY', 'UNSET_PRIMARY');

-- CreateEnum
CREATE TYPE "VideoTagEventType" AS ENUM ('ATTACHED', 'REMOVED', 'REATTACHED');

-- CreateEnum
CREATE TYPE "SemitagEventType" AS ENUM ('ATTACHED', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NicovideoVideoSourceEventType" AS ENUM ('CREATED');

-- CreateTable
CREATE TABLE "Mylist" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shareRange" "MylistShareRange" NOT NULL DEFAULT 'PRIVATE',
    "isLikeList" BOOLEAN NOT NULL DEFAULT false,
    "holderId" TEXT NOT NULL,

    CONSTRAINT "Mylist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MylistRegistration" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "videoId" TEXT NOT NULL,
    "mylistId" TEXT NOT NULL,

    CONSTRAINT "MylistRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MylistGroup" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "holderId" TEXT NOT NULL,

    CONSTRAINT "MylistGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MylistGroupMylistInclsion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mylistId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "MylistGroupMylistInclsion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "secret" VARCHAR(64) NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "serial" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meaningless" BOOLEAN NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "TagName" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "TagName_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "TagParent" (
    "id" TEXT NOT NULL,
    "isExplicit" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "childId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,

    CONSTRAINT "TagParent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagParentEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "tagParentId" TEXT NOT NULL,
    "type" "TagParentEventType" NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "TagParentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" CITEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isEmailConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "role" "UserRole" NOT NULL DEFAULT 'NORMAL',
    "displayName" TEXT NOT NULL,
    "icon" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "serial" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "videoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "VideoEventType" NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "VideoEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoTitle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "videoId" TEXT NOT NULL,

    CONSTRAINT "VideoTitle_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "VideoThumbnail" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "videoId" TEXT NOT NULL,

    CONSTRAINT "VideoThumbnail_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "VideoTag" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tagId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VideoTag_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Semitag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "videoId" TEXT NOT NULL,
    "isChecked" BOOLEAN NOT NULL,
    "videoTagId" TEXT,

    CONSTRAINT "Semitag_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "NicovideoVideoSource" (
    "id" TEXT NOT NULL,
    "sourceId" CITEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "videoId" TEXT NOT NULL,

    CONSTRAINT "NicovideoVideoSource_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "MylistRegistration_mylistId_videoId_key" ON "MylistRegistration"("mylistId", "videoId");

-- CreateIndex
CREATE UNIQUE INDEX "MylistGroupMylistInclsion_mylistId_groupId_key" ON "MylistGroupMylistInclsion"("mylistId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_serial_key" ON "Tag"("serial");

-- CreateIndex
CREATE UNIQUE INDEX "TagName_name_tagId_key" ON "TagName"("name", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "TagParent_parentId_childId_key" ON "TagParent"("parentId", "childId");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Video_serial_key" ON "Video"("serial");

-- CreateIndex
CREATE UNIQUE INDEX "VideoTitle_videoId_title_key" ON "VideoTitle"("videoId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "VideoTag_videoId_tagId_key" ON "VideoTag"("videoId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "NicovideoVideoSource_sourceId_key" ON "NicovideoVideoSource"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "NicovideoVideoSource_sourceId_videoId_key" ON "NicovideoVideoSource"("sourceId", "videoId");

-- AddForeignKey
ALTER TABLE "Mylist" ADD CONSTRAINT "Mylist_holderId_fkey" FOREIGN KEY ("holderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MylistRegistration" ADD CONSTRAINT "MylistRegistration_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MylistRegistration" ADD CONSTRAINT "MylistRegistration_mylistId_fkey" FOREIGN KEY ("mylistId") REFERENCES "Mylist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MylistGroup" ADD CONSTRAINT "MylistGroup_holderId_fkey" FOREIGN KEY ("holderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MylistGroupMylistInclsion" ADD CONSTRAINT "MylistGroupMylistInclsion_mylistId_fkey" FOREIGN KEY ("mylistId") REFERENCES "Mylist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MylistGroupMylistInclsion" ADD CONSTRAINT "MylistGroupMylistInclsion_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MylistGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagEvent" ADD CONSTRAINT "TagEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagEvent" ADD CONSTRAINT "TagEvent_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagName" ADD CONSTRAINT "TagName_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagNameEvent" ADD CONSTRAINT "TagNameEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagNameEvent" ADD CONSTRAINT "TagNameEvent_tagNameId_fkey" FOREIGN KEY ("tagNameId") REFERENCES "TagName"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagParent" ADD CONSTRAINT "TagParent_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagParent" ADD CONSTRAINT "TagParent_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagParentEvent" ADD CONSTRAINT "TagParentEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagParentEvent" ADD CONSTRAINT "TagParentEvent_tagParentId_fkey" FOREIGN KEY ("tagParentId") REFERENCES "TagParent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoEvent" ADD CONSTRAINT "VideoEvent_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoEvent" ADD CONSTRAINT "VideoEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoTitle" ADD CONSTRAINT "VideoTitle_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoTitleEvent" ADD CONSTRAINT "VideoTitleEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoTitleEvent" ADD CONSTRAINT "VideoTitleEvent_videoTitleId_fkey" FOREIGN KEY ("videoTitleId") REFERENCES "VideoTitle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoThumbnail" ADD CONSTRAINT "VideoThumbnail_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoThumbnailEvent" ADD CONSTRAINT "VideoThumbnailEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoThumbnailEvent" ADD CONSTRAINT "VideoThumbnailEvent_videoThumbnailId_fkey" FOREIGN KEY ("videoThumbnailId") REFERENCES "VideoThumbnail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoTag" ADD CONSTRAINT "VideoTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoTag" ADD CONSTRAINT "VideoTag_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoTagEvent" ADD CONSTRAINT "VideoTagEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoTagEvent" ADD CONSTRAINT "VideoTagEvent_videoTagId_fkey" FOREIGN KEY ("videoTagId") REFERENCES "VideoTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Semitag" ADD CONSTRAINT "Semitag_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Semitag" ADD CONSTRAINT "Semitag_videoTagId_fkey" FOREIGN KEY ("videoTagId") REFERENCES "VideoTag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemitagEvent" ADD CONSTRAINT "SemitagEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemitagEvent" ADD CONSTRAINT "SemitagEvent_semitagId_fkey" FOREIGN KEY ("semitagId") REFERENCES "Semitag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NicovideoVideoSource" ADD CONSTRAINT "NicovideoVideoSource_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NicovideoVideoSourceEvent" ADD CONSTRAINT "NicovideoVideoSourceEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NicovideoVideoSourceEvent" ADD CONSTRAINT "NicovideoVideoSourceEvent_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "NicovideoVideoSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
