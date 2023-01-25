/*
  Warnings:

  - You are about to drop the `video_sources` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[mylistId,groupId]` on the table `mylist_group_mylist_inclusions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mylistId,videoId]` on the table `mylist_registrations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[parentId,childId]` on the table `tag_parents` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Made the column `videoId` on table `mylist_registrations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `mylistId` on table `mylist_registrations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `videoId` on table `semitags` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tagId` on table `semitags` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tagId` on table `tag_names` required. This step will fail if there are existing NULL values in that column.
  - Made the column `parentId` on table `tag_parents` required. This step will fail if there are existing NULL values in that column.
  - Made the column `childId` on table `tag_parents` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "mylist_group_mylist_inclusions" DROP CONSTRAINT "FK_105128216044972f3ad4b507d03";

-- DropForeignKey
ALTER TABLE "mylist_group_mylist_inclusions" DROP CONSTRAINT "FK_9e69a6b42c71dfae6fb726a73ac";

-- DropForeignKey
ALTER TABLE "mylist_groups" DROP CONSTRAINT "FK_715f1efaef409a44ec479f0e84f";

-- DropForeignKey
ALTER TABLE "mylist_registrations" DROP CONSTRAINT "FK_30b4c5755140583330020e4639e";

-- DropForeignKey
ALTER TABLE "mylist_registrations" DROP CONSTRAINT "FK_abda40557147e25d8cb95fee078";

-- DropForeignKey
ALTER TABLE "mylists" DROP CONSTRAINT "FK_a6e470bf3e6bbfb270f9295cb2e";

-- DropForeignKey
ALTER TABLE "nicovideo_video_sources" DROP CONSTRAINT "FK_2d2697091069023ae1fffac0ea8";

-- DropForeignKey
ALTER TABLE "semitags" DROP CONSTRAINT "FK_037d6465fa7dd9a195533416f63";

-- DropForeignKey
ALTER TABLE "semitags" DROP CONSTRAINT "FK_3e324d47c1a1d957e2e6f2d9afc";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "FK_57de40bc620f456c7311aa3a1e6";

-- DropForeignKey
ALTER TABLE "tag_names" DROP CONSTRAINT "FK_551baf525c6a275793afce4125e";

-- DropForeignKey
ALTER TABLE "tag_parents" DROP CONSTRAINT "FK_ce25fe074ec6e65ce7e8f078a00";

-- DropForeignKey
ALTER TABLE "tag_parents" DROP CONSTRAINT "FK_f22a29123c357c414694215e018";

-- DropForeignKey
ALTER TABLE "video_sources" DROP CONSTRAINT "FK_bbae903425b10f56551dc60148c";

-- DropForeignKey
ALTER TABLE "video_tags" DROP CONSTRAINT "FK_6f9964c104164fb5eed88b52f4a";

-- DropForeignKey
ALTER TABLE "video_tags" DROP CONSTRAINT "FK_92a248c1d263a8eddb8ef92d750";

-- DropForeignKey
ALTER TABLE "video_thumbnails" DROP CONSTRAINT "FK_91f45ae79e0bf6f2dea2696112d";

-- DropForeignKey
ALTER TABLE "video_titles" DROP CONSTRAINT "FK_d69ac721691fba16dc5f08f0658";

-- AlterTable
ALTER TABLE "mylist_group_mylist_inclusions" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "groupId" SET DATA TYPE TEXT,
ALTER COLUMN "mylistId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "mylist_groups" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "holderId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "mylist_registrations" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "videoId" SET NOT NULL,
ALTER COLUMN "videoId" SET DATA TYPE TEXT,
ALTER COLUMN "mylistId" SET NOT NULL,
ALTER COLUMN "mylistId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "mylists" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "holderId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "nicovideo_video_sources" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "videoId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "semitags" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "videoId" SET NOT NULL,
ALTER COLUMN "videoId" SET DATA TYPE TEXT,
ALTER COLUMN "tagId" SET NOT NULL,
ALTER COLUMN "tagId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "sessions" ALTER COLUMN "expiredAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "tag_names" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "tagId" SET NOT NULL,
ALTER COLUMN "tagId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "tag_parents" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "parentId" SET NOT NULL,
ALTER COLUMN "parentId" SET DATA TYPE TEXT,
ALTER COLUMN "childId" SET NOT NULL,
ALTER COLUMN "childId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "tags" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "video_tags" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "tagId" SET DATA TYPE TEXT,
ALTER COLUMN "videoId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "video_thumbnails" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "videoId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "video_titles" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "videos" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- DropTable
DROP TABLE "video_sources";

-- CreateIndex
CREATE UNIQUE INDEX "mylist_group_mylist_inclusions_mylistId_groupId_key" ON "mylist_group_mylist_inclusions"("mylistId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "mylist_registrations_mylistId_videoId_key" ON "mylist_registrations"("mylistId", "videoId");

-- CreateIndex
CREATE UNIQUE INDEX "tag_parents_parentId_childId_key" ON "tag_parents"("parentId", "childId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "mylist_groups" ADD CONSTRAINT "mylist_groups_holderId_fkey" FOREIGN KEY ("holderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mylist_group_mylist_inclusions" ADD CONSTRAINT "mylist_group_mylist_inclusions_mylistId_fkey" FOREIGN KEY ("mylistId") REFERENCES "mylists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mylist_group_mylist_inclusions" ADD CONSTRAINT "mylist_group_mylist_inclusions_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "mylist_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mylists" ADD CONSTRAINT "mylists_holderId_fkey" FOREIGN KEY ("holderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mylist_registrations" ADD CONSTRAINT "mylist_registrations_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mylist_registrations" ADD CONSTRAINT "mylist_registrations_mylistId_fkey" FOREIGN KEY ("mylistId") REFERENCES "mylists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nicovideo_video_sources" ADD CONSTRAINT "nicovideo_video_sources_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semitags" ADD CONSTRAINT "semitags_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semitags" ADD CONSTRAINT "semitags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_names" ADD CONSTRAINT "tag_names_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_parents" ADD CONSTRAINT "tag_parents_childId_fkey" FOREIGN KEY ("childId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_parents" ADD CONSTRAINT "tag_parents_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_tags" ADD CONSTRAINT "video_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_tags" ADD CONSTRAINT "video_tags_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_thumbnails" ADD CONSTRAINT "video_thumbnails_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_titles" ADD CONSTRAINT "video_titles_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "UQ_208e64d42387623cad7f2e4fb6b" RENAME TO "nicovideo_video_sources_sourceId_key";

-- RenameIndex
ALTER INDEX "UQ_76e7668f8eb32271df39070d2ca" RENAME TO "nicovideo_video_sources_videoId_key";

-- RenameIndex
ALTER INDEX "UQ_51b8b26ac168fbe7d6f5653e6cf" RENAME TO "users_name_key";

-- RenameIndex
ALTER INDEX "UQ_7995bc8220363477e15fff8bcdc" RENAME TO "video_tags_tagId_videoId_key";
