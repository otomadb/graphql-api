/*
  Warnings:

  - You are about to drop the column `range` on the `mylists` table. All the data in the column will be lost.
  - Added the required column `shareRange` to the `mylists` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "mylists" DROP COLUMN "range",
ADD COLUMN     "shareRange" "mylists_range_enum" NOT NULL;
