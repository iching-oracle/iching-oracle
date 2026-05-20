-- Denormalized hexagram names for history list performance
ALTER TABLE "Reading" ADD COLUMN "primaryHexagramName" TEXT;
ALTER TABLE "Reading" ADD COLUMN "finalHexagramName" TEXT;
