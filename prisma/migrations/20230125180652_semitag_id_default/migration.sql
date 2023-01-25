/*
  Warnings:

  - The primary key for the `semitags` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "semitags" DROP CONSTRAINT "semitags_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "semitags_pkey" PRIMARY KEY ("id");
