-- Builder-only public CTA: hide this building's prices and route buyers to CRM intake.
ALTER TABLE "buildings" ADD COLUMN "price_on_request_enabled" BOOLEAN NOT NULL DEFAULT false;
