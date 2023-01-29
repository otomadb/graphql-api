-- AlterTable
ALTER TABLE "Mylist" ALTER COLUMN "shareRange" SET DEFAULT 'PRIVATE',
ALTER COLUMN "isLikeList" SET DEFAULT false;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "isEmailConfirmed" SET DEFAULT false;
