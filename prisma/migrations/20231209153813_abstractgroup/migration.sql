-- CreateEnum
CREATE TYPE "AbstractGroupingEventType" AS ENUM ('INCLUDE', 'EXCLUDE', 'REINCLUDE');

-- CreateTable
CREATE TABLE "AbstractGroup" (
    "keyword" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "theme" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AbstractGroupName" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "groupKeyword" TEXT NOT NULL,

    CONSTRAINT "AbstractGroupName_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbstractGrouping" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "groupKeyword" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "disabled" BOOLEAN NOT NULL,

    CONSTRAINT "AbstractGrouping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbstractGroupingEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "abstractGroupingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AbstractGroupingEventType" NOT NULL,
    "payload" JSONB,

    CONSTRAINT "AbstractGroupingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AbstractGroup_keyword_key" ON "AbstractGroup"("keyword");

-- CreateIndex
CREATE UNIQUE INDEX "AbstractGroupName_groupKeyword_locale_key" ON "AbstractGroupName"("groupKeyword", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "AbstractGrouping_groupKeyword_tagId_key" ON "AbstractGrouping"("groupKeyword", "tagId");

-- AddForeignKey
ALTER TABLE "AbstractGroupName" ADD CONSTRAINT "AbstractGroupName_groupKeyword_fkey" FOREIGN KEY ("groupKeyword") REFERENCES "AbstractGroup"("keyword") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbstractGrouping" ADD CONSTRAINT "AbstractGrouping_groupKeyword_fkey" FOREIGN KEY ("groupKeyword") REFERENCES "AbstractGroup"("keyword") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbstractGrouping" ADD CONSTRAINT "AbstractGrouping_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbstractGroupingEvent" ADD CONSTRAINT "AbstractGroupingEvent_abstractGroupingId_fkey" FOREIGN KEY ("abstractGroupingId") REFERENCES "AbstractGrouping"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbstractGroupingEvent" ADD CONSTRAINT "AbstractGroupingEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
