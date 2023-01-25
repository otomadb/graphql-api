-- DropForeignKey
ALTER TABLE "semitags" DROP CONSTRAINT "semitags_tagId_fkey";

-- AlterTable
ALTER TABLE "semitags" ALTER COLUMN "tagId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "semitags" ADD CONSTRAINT "semitags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;
