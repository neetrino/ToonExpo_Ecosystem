-- CreateEnum
CREATE TYPE "DealStage" AS ENUM ('NEW_REQUEST', 'ASSIGNED', 'CONTACTED', 'FOLLOW_UP_NEEDED', 'APARTMENT_SELECTED', 'RESERVED', 'CONVERTED', 'CLOSED', 'LOST');

-- CreateEnum
CREATE TYPE "RequestSource" AS ENUM ('PROJECT_PAGE', 'APARTMENT_PAGE', 'BUILDER_QR_SCAN', 'MANUAL_BUILDER_ENTRY', 'EVENT_INTERACTION');

-- CreateEnum
CREATE TYPE "DealActivityType" AS ENUM ('COMMENT', 'FOLLOW_UP', 'STATUS_CHANGE');

-- CreateEnum
CREATE TYPE "QrScanPurpose" AS ENUM ('BUILDER_SCAN', 'ENTRANCE_CHECKIN', 'BUYER_SELF_VIEW', 'UNKNOWN');

-- CreateTable
CREATE TABLE "Deal" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "stage" "DealStage" NOT NULL DEFAULT 'NEW_REQUEST',
    "source" "RequestSource" NOT NULL,
    "buyerUserId" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "title" TEXT,
    "message" TEXT,
    "assignedUserId" TEXT,
    "createdByUserId" TEXT,
    "projectId" TEXT,
    "lastActivityAt" TIMESTAMP(3),
    "nextFollowUpAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealApartment" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealApartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealActivity" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "authorUserId" TEXT,
    "type" "DealActivityType" NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QrScanLog" (
    "id" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "scannedByUserId" TEXT NOT NULL,
    "companyId" TEXT,
    "purpose" "QrScanPurpose" NOT NULL DEFAULT 'UNKNOWN',
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QrScanLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Deal_companyId_stage_idx" ON "Deal"("companyId", "stage");

-- CreateIndex
CREATE INDEX "Deal_buyerUserId_idx" ON "Deal"("buyerUserId");

-- CreateIndex
CREATE INDEX "Deal_createdAt_idx" ON "Deal"("createdAt");

-- CreateIndex
CREATE INDEX "DealApartment_dealId_idx" ON "DealApartment"("dealId");

-- CreateIndex
CREATE INDEX "DealApartment_apartmentId_idx" ON "DealApartment"("apartmentId");

-- CreateIndex
CREATE UNIQUE INDEX "DealApartment_dealId_apartmentId_key" ON "DealApartment"("dealId", "apartmentId");

-- CreateIndex
CREATE INDEX "DealActivity_dealId_idx" ON "DealActivity"("dealId");

-- CreateIndex
CREATE INDEX "QrScanLog_qrCodeId_idx" ON "QrScanLog"("qrCodeId");

-- CreateIndex
CREATE INDEX "QrScanLog_scannedByUserId_idx" ON "QrScanLog"("scannedByUserId");

-- CreateIndex
CREATE INDEX "QrScanLog_companyId_idx" ON "QrScanLog"("companyId");

-- CreateIndex
CREATE INDEX "QrScanLog_scannedAt_idx" ON "QrScanLog"("scannedAt");

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_buyerUserId_fkey" FOREIGN KEY ("buyerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealApartment" ADD CONSTRAINT "DealApartment_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealApartment" ADD CONSTRAINT "DealApartment_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealActivity" ADD CONSTRAINT "DealActivity_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealActivity" ADD CONSTRAINT "DealActivity_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrScanLog" ADD CONSTRAINT "QrScanLog_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QrCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrScanLog" ADD CONSTRAINT "QrScanLog_scannedByUserId_fkey" FOREIGN KEY ("scannedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrScanLog" ADD CONSTRAINT "QrScanLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

