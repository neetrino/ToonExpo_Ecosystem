-- CreateEnum
CREATE TYPE "BosProvisioningStatus" AS ENUM ('success', 'linked_existing', 'failed', 'partial');

-- CreateEnum
CREATE TYPE "BosProvisioningCompanyType" AS ENUM ('builder', 'partner', 'bank');

-- CreateEnum
CREATE TYPE "IntegrationAuditAction" AS ENUM ('provisioning_received', 'company_created', 'company_linked', 'user_created', 'user_linked', 'member_created', 'invitation_sent', 'provisioning_failed', 'provisioning_retried', 'result_returned');

-- CreateTable
CREATE TABLE "bos_provisioning_requests" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "bos_company_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "company_type" "BosProvisioningCompanyType" NOT NULL,
    "primary_contact_name" TEXT NOT NULL,
    "primary_contact_email" TEXT NOT NULL,
    "primary_contact_phone" TEXT,
    "event_cycle_id" TEXT,
    "event_cycle_name" TEXT,
    "requested_modules" TEXT[],
    "status" "BosProvisioningStatus" NOT NULL,
    "toonexpo_company_id" TEXT,
    "primary_user_id" TEXT,
    "error_message" TEXT,
    "attempt_count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bos_provisioning_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_audit_logs" (
    "id" TEXT NOT NULL,
    "action" "IntegrationAuditAction" NOT NULL,
    "provisioning_request_id" TEXT,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bos_provisioning_requests_request_id_key" ON "bos_provisioning_requests"("request_id");

-- CreateIndex
CREATE INDEX "bos_provisioning_requests_bos_company_id_idx" ON "bos_provisioning_requests"("bos_company_id");

-- CreateIndex
CREATE INDEX "bos_provisioning_requests_status_idx" ON "bos_provisioning_requests"("status");

-- CreateIndex
CREATE INDEX "bos_provisioning_requests_primary_contact_email_idx" ON "bos_provisioning_requests"("primary_contact_email");

-- CreateIndex
CREATE INDEX "bos_provisioning_requests_created_at_idx" ON "bos_provisioning_requests"("created_at");

-- CreateIndex
CREATE INDEX "integration_audit_logs_provisioning_request_id_created_at_idx" ON "integration_audit_logs"("provisioning_request_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "companies_bos_company_id_key" ON "companies"("bos_company_id");

-- AddForeignKey
ALTER TABLE "integration_audit_logs" ADD CONSTRAINT "integration_audit_logs_provisioning_request_id_fkey" FOREIGN KEY ("provisioning_request_id") REFERENCES "bos_provisioning_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
