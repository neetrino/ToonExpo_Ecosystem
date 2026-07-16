-- CreateEnum
CREATE TYPE "ExhibitionEventStatus" AS ENUM ('PLANNING', 'ACTIVE', 'COMPLETED', 'ARCHIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CheckInStatus" AS ENUM ('ALLOWED');

-- CreateTable
CREATE TABLE "ExhibitionEvent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "ExhibitionEventStatus" NOT NULL DEFAULT 'PLANNING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExhibitionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckIn" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "buyerProfileId" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "checkedInByUserId" TEXT NOT NULL,
    "status" "CheckInStatus" NOT NULL DEFAULT 'ALLOWED',
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExhibitionEvent_code_key" ON "ExhibitionEvent"("code");

-- CreateIndex
CREATE INDEX "ExhibitionEvent_status_idx" ON "ExhibitionEvent"("status");

-- CreateIndex
CREATE INDEX "CheckIn_eventId_checkedInAt_idx" ON "CheckIn"("eventId", "checkedInAt");

-- CreateIndex
CREATE INDEX "CheckIn_buyerProfileId_idx" ON "CheckIn"("buyerProfileId");

-- CreateIndex
CREATE INDEX "CheckIn_qrCodeId_idx" ON "CheckIn"("qrCodeId");

-- CreateIndex
CREATE INDEX "CheckIn_checkedInByUserId_idx" ON "CheckIn"("checkedInByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "CheckIn_eventId_buyerProfileId_key" ON "CheckIn"("eventId", "buyerProfileId");

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ExhibitionEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_buyerProfileId_fkey" FOREIGN KEY ("buyerProfileId") REFERENCES "BuyerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QrCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_checkedInByUserId_fkey" FOREIGN KEY ("checkedInByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
