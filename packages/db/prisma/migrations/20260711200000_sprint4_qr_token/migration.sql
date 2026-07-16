-- AlterTable
ALTER TABLE "QrCode" ADD COLUMN "token" TEXT;

-- Backfill existing rows with a placeholder unique token (revoked or unused);
-- application code regenerates real tokens via ensureBuyerQr / regenerateBuyerQr.
UPDATE "QrCode" SET "token" = 'legacy_' || "id" WHERE "token" IS NULL;

ALTER TABLE "QrCode" ALTER COLUMN "token" SET NOT NULL;

CREATE UNIQUE INDEX "QrCode_token_key" ON "QrCode"("token");
