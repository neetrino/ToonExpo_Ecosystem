-- Project bank partner offers may be bank-agnostic (same as templates).
ALTER TABLE "project_bank_partner_offers" DROP CONSTRAINT IF EXISTS "project_bank_partner_offers_partner_company_id_fkey";

ALTER TABLE "project_bank_partner_offers" ALTER COLUMN "partner_company_id" DROP NOT NULL;

ALTER TABLE "project_bank_partner_offers" ADD CONSTRAINT "project_bank_partner_offers_partner_company_id_fkey" FOREIGN KEY ("partner_company_id") REFERENCES "partner_companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
