-- CreateEnum
CREATE TYPE "QrCodeStatus" AS ENUM ('active', 'inactive', 'blocked');

-- CreateEnum
CREATE TYPE "QrScanContext" AS ENUM ('builder_scan', 'entrance_checkin', 'buyer_self_view', 'unknown');

-- CreateEnum
CREATE TYPE "QrScanResultStatus" AS ENUM ('resolved', 'invalid', 'blocked', 'unauthorized', 'error');

-- CreateTable
CREATE TABLE "qr_codes" (
    "id" TEXT NOT NULL,
    "buyer_profile_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "token_encrypted" TEXT NOT NULL,
    "status" "QrCodeStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "regenerated_at" TIMESTAMP(3),
    "blocked_at" TIMESTAMP(3),
    "blocked_reason" TEXT,

    CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_scan_events" (
    "id" TEXT NOT NULL,
    "qr_code_id" TEXT NOT NULL,
    "buyer_profile_id" TEXT NOT NULL,
    "scanner_user_id" TEXT,
    "scanner_company_id" TEXT,
    "scanner_role" TEXT,
    "scan_context" "QrScanContext" NOT NULL,
    "result_status" "QrScanResultStatus" NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qr_scan_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "qr_codes_buyer_profile_id_key" ON "qr_codes"("buyer_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "qr_codes_token_hash_key" ON "qr_codes"("token_hash");

-- CreateIndex
CREATE INDEX "qr_codes_status_idx" ON "qr_codes"("status");

-- CreateIndex
CREATE INDEX "qr_scan_events_qr_code_id_idx" ON "qr_scan_events"("qr_code_id");

-- CreateIndex
CREATE INDEX "qr_scan_events_buyer_profile_id_idx" ON "qr_scan_events"("buyer_profile_id");

-- CreateIndex
CREATE INDEX "qr_scan_events_scanner_user_id_idx" ON "qr_scan_events"("scanner_user_id");

-- CreateIndex
CREATE INDEX "qr_scan_events_scanner_company_id_idx" ON "qr_scan_events"("scanner_company_id");

-- CreateIndex
CREATE INDEX "qr_scan_events_created_at_idx" ON "qr_scan_events"("created_at");

-- AddForeignKey
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_buyer_profile_id_fkey" FOREIGN KEY ("buyer_profile_id") REFERENCES "buyer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_scan_events" ADD CONSTRAINT "qr_scan_events_qr_code_id_fkey" FOREIGN KEY ("qr_code_id") REFERENCES "qr_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
