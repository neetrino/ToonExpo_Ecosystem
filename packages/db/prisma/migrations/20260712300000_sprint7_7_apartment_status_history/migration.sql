-- CreateEnum
CREATE TYPE "ApartmentStatusChangeSource" AS ENUM ('CRM_STAGE', 'MANUAL_INVENTORY', 'SYSTEM');

-- CreateTable
CREATE TABLE "ApartmentStatusHistory" (
    "id" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "dealId" TEXT,
    "source" "ApartmentStatusChangeSource" NOT NULL,
    "oldStatus" "ApartmentStatus" NOT NULL,
    "newStatus" "ApartmentStatus" NOT NULL,
    "changedByUserId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApartmentStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApartmentStatusHistory_apartmentId_createdAt_idx" ON "ApartmentStatusHistory"("apartmentId", "createdAt");

-- CreateIndex
CREATE INDEX "ApartmentStatusHistory_dealId_idx" ON "ApartmentStatusHistory"("dealId");

-- CreateIndex
CREATE INDEX "ApartmentStatusHistory_changedByUserId_idx" ON "ApartmentStatusHistory"("changedByUserId");

-- AddForeignKey
ALTER TABLE "ApartmentStatusHistory" ADD CONSTRAINT "ApartmentStatusHistory_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApartmentStatusHistory" ADD CONSTRAINT "ApartmentStatusHistory_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApartmentStatusHistory" ADD CONSTRAINT "ApartmentStatusHistory_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
