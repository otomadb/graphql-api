/*
  Warnings:

  - A unique constraint covering the columns `[serial]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "serial" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Tag_serial_key" ON "Tag"("serial");
