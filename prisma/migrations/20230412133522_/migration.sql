-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ACCEPTING_NICOVIDEO_REGISTRATION_REQUEST', 'REJECTING_NICOVIDEO_REGISTRATION_REQUEST');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifyToId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_notifyToId_fkey" FOREIGN KEY ("notifyToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
