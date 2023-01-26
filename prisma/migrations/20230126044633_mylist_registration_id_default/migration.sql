/*
  Warnings:

  - The primary key for the `mylist_registrations` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "mylist_registrations" DROP CONSTRAINT "mylist_registrations_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "mylist_registrations_pkey" PRIMARY KEY ("id");
