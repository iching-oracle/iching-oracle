-- AlterTable
ALTER TABLE "Reading" ADD COLUMN "interpretationMode" TEXT NOT NULL DEFAULT 'traditional';
ALTER TABLE "Reading" ADD COLUMN "summary" TEXT;
ALTER TABLE "Reading" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'general';
ALTER TABLE "Reading" ADD COLUMN "isFavorite" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Reading_userId_isFavorite_idx" ON "Reading"("userId", "isFavorite");
CREATE INDEX "Reading_userId_category_idx" ON "Reading"("userId", "category");

-- Backfill summaries from existing interpretations
UPDATE "Reading"
SET "summary" = LEFT("interpretation", 280)
WHERE "summary" IS NULL AND LENGTH("interpretation") > 0;
