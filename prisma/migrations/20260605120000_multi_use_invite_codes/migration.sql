-- Multi-use invite codes: source tracking, isActive, usedCount rename, user FK, launch seeds

ALTER TABLE "InviteCode" RENAME COLUMN "useCount" TO "usedCount";

ALTER TABLE "InviteCode"
  ADD COLUMN "source" TEXT,
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

UPDATE "InviteCode" SET "isActive" = false WHERE "revokedAt" IS NOT NULL;

CREATE INDEX "InviteCode_source_idx" ON "InviteCode"("source");
CREATE INDEX "InviteCode_isActive_idx" ON "InviteCode"("isActive");

ALTER TABLE "User" ADD COLUMN "inviteCodeId" TEXT;

ALTER TABLE "User"
  ADD CONSTRAINT "User_inviteCodeId_fkey"
  FOREIGN KEY ("inviteCodeId") REFERENCES "InviteCode"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Beta launch shared invite codes (100 seats each, no expiration)
INSERT INTO "InviteCode" ("id", "code", "maxUses", "usedCount", "isActive", "source", "note", "createdAt", "updatedAt")
VALUES
  ('clbetaquietpath001', 'QUIETPATH', 100, 0, true, 'Beta Launch', 'Quiet early access campaign', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('clbetafirstlight01', 'FIRSTLIGHT', 100, 0, true, 'Beta Launch', 'Founding circle campaign', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('clbetareddit100001', 'REDDIT100', 100, 0, true, 'Reddit Beta', 'Reddit community beta wave', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
