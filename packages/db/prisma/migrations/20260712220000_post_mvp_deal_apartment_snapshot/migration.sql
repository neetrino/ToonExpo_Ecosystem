-- Snapshot apartment price/status when linking to a CRM deal (doc 08-CRM-Lead-Intake/07).
ALTER TABLE "DealApartment" ADD COLUMN "priceAmdSnapshot" INTEGER;
ALTER TABLE "DealApartment" ADD COLUMN "statusSnapshot" "ApartmentStatus";
ALTER TABLE "DealApartment" ADD COLUMN "snapshotAt" TIMESTAMP(3);
