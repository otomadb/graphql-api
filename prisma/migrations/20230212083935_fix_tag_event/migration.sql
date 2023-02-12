/*
  Warnings:

  - Changed the type of `type` on the `TagEvent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "TagEvent" DROP COLUMN "type",
ADD COLUMN     "type" "TagEventType" NOT NULL;
