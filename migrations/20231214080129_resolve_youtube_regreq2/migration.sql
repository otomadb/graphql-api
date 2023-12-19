/*
  Warnings:

  - A unique constraint covering the columns `[notificationId]` on the table `YoutubeRegistrationRequestChecking` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "YoutubeRegistrationRequestChecking" ADD COLUMN     "notificationId" TEXT,
ADD COLUMN     "resolved" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeRegistrationRequestChecking_notificationId_key" ON "YoutubeRegistrationRequestChecking"("notificationId");

-- AddForeignKey
ALTER TABLE "YoutubeRegistrationRequestChecking" ADD CONSTRAINT "YoutubeRegistrationRequestChecking_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE SET NULL ON UPDATE CASCADE;
