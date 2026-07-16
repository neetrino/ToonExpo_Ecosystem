-- CreateEnum
CREATE TYPE "IntegrationDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "IntegrationAuditStatus" AS ENUM ('RECEIVED', 'SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "IntegrationAuditLog" (
    "id" TEXT NOT NULL,
    "direction" "IntegrationDirection" NOT NULL,
    "operation" TEXT NOT NULL,
    "externalRef" TEXT,
    "requestId" TEXT,
    "status" "IntegrationAuditStatus" NOT NULL,
    "message" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProvisioningRequest" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "bosCompanyId" TEXT NOT NULL,
    "primaryContactEmail" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "toonexpoCompanyId" TEXT,
    "primaryUserId" TEXT,
    "errorMessage" TEXT,
    "responseSnapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProvisioningRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IntegrationAuditLog_createdAt_idx" ON "IntegrationAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "IntegrationAuditLog_operation_createdAt_idx" ON "IntegrationAuditLog"("operation", "createdAt");

-- CreateIndex
CREATE INDEX "IntegrationAuditLog_externalRef_idx" ON "IntegrationAuditLog"("externalRef");

-- CreateIndex
CREATE INDEX "IntegrationAuditLog_requestId_idx" ON "IntegrationAuditLog"("requestId");

-- CreateIndex
CREATE INDEX "IntegrationAuditLog_status_createdAt_idx" ON "IntegrationAuditLog"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProvisioningRequest_requestId_key" ON "ProvisioningRequest"("requestId");

-- CreateIndex
CREATE INDEX "ProvisioningRequest_bosCompanyId_idx" ON "ProvisioningRequest"("bosCompanyId");

-- CreateIndex
CREATE INDEX "ProvisioningRequest_primaryContactEmail_idx" ON "ProvisioningRequest"("primaryContactEmail");

-- CreateIndex
CREATE INDEX "ProvisioningRequest_status_idx" ON "ProvisioningRequest"("status");
