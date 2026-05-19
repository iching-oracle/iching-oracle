-- Casting engine: line values, changing lines, transformed hexagram

ALTER TABLE "Reading" ADD COLUMN "lineValues" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Reading" ADD COLUMN "changingLines" TEXT;
ALTER TABLE "Reading" ADD COLUMN "transformedHexagram" INTEGER;

-- Preserve legacy changing line positions
UPDATE "Reading"
SET "changingLines" = "changing"
WHERE "changing" IS NOT NULL AND "changing" != '';

ALTER TABLE "Reading" DROP COLUMN "changing";
