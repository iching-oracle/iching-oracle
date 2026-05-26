-- AlterTable
ALTER TABLE "Reading" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Reading" ADD COLUMN "shareId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Reading_shareId_key" ON "Reading"("shareId");
