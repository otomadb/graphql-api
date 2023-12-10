/*
  Warnings:

  - You are about to drop the `CategoryTagTyping` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CategoryTagTyping" DROP CONSTRAINT "CategoryTagTyping_createdById_fkey";

-- DropForeignKey
ALTER TABLE "CategoryTagTyping" DROP CONSTRAINT "CategoryTagTyping_tagId_fkey";

-- DropTable
DROP TABLE "CategoryTagTyping";

-- DropEnum
DROP TYPE "CategoryTagType";
