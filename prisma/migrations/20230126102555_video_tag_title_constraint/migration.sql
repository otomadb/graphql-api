/*
  Warnings:

  - A unique constraint covering the columns `[videoId,tagId]` on the table `video_tags` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[videoId,title]` on the table `video_titles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "video_tags_tagId_videoId_key";

-- CreateIndex
CREATE UNIQUE INDEX "video_tags_videoId_tagId_key" ON "video_tags"("videoId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "video_titles_videoId_title_key" ON "video_titles"("videoId", "title");
