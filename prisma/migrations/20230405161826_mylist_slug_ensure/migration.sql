/*
  Warnings:

  - A unique constraint covering the columns `[holderId,slug]` on the table `Mylist` will be added. If there are existing duplicate values, this will fail.
  - Made the column `slug` on table `Mylist` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Mylist" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Mylist_holderId_slug_key" ON "Mylist"("holderId", "slug");
