-- Make finance templates bank-agnostic (name-only reusable templates).
ALTER TABLE "bank_partner_offer_templates" DROP CONSTRAINT IF EXISTS "bank_partner_offer_templates_partner_company_id_fkey";

ALTER TABLE "bank_partner_offer_templates" ALTER COLUMN "partner_company_id" DROP NOT NULL;

ALTER TABLE "bank_partner_offer_templates" ADD CONSTRAINT "bank_partner_offer_templates_partner_company_id_fkey" FOREIGN KEY ("partner_company_id") REFERENCES "partner_companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Detach existing seeded rows from banks and give generic Template N names.
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY "created_at" ASC, id ASC) AS rn
  FROM "bank_partner_offer_templates"
)
UPDATE "bank_partner_offer_templates" AS t
SET
  "partner_company_id" = NULL,
  "name" = 'Template ' || ranked.rn,
  "updated_at" = CURRENT_TIMESTAMP
FROM ranked
WHERE t.id = ranked.id;
