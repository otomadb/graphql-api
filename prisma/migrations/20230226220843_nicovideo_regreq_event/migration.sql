-- CreateEnum
CREATE TYPE "NicovideoRegistrationRequestEventType" AS ENUM ('REQUEST', 'ACCEPT', 'REJECT');

-- CreateTable
CREATE TABLE "NicovideoRegistrationRequestEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "type" "NicovideoRegistrationRequestEventType" NOT NULL,
    "payload" JSONB,

    CONSTRAINT "NicovideoRegistrationRequestEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NicovideoRegistrationRequestEvent" ADD CONSTRAINT "NicovideoRegistrationRequestEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NicovideoRegistrationRequestEvent" ADD CONSTRAINT "NicovideoRegistrationRequestEvent_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "NicovideoRegistrationRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
