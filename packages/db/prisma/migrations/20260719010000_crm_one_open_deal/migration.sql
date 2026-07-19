-- Enforce at most one open CRM deal per (company_id, buyer_profile_id).
-- Open set mirrors apps/api CRM_OPEN_DEAL_STATUSES (pipeline not yet terminal):
--   new_request, assigned, contacted, follow_up_needed, apartment_selected, reserved
-- Terminal statuses (converted, closed, lost) are excluded so a buyer may have
-- a new open deal after a prior deal finishes.
--
-- Dedupe strategy (safe, non-destructive to request history):
-- Keep the most recently updated open deal per pair; demote older open duplicates
-- to status 'closed' (no lost_reason invented; requests remain linked to their deals).

WITH ranked_open_deals AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY company_id, buyer_profile_id
      ORDER BY updated_at DESC, created_at DESC, id DESC
    ) AS rn
  FROM "crm_deals"
  WHERE "buyer_profile_id" IS NOT NULL
    AND "status" IN (
      'new_request',
      'assigned',
      'contacted',
      'follow_up_needed',
      'apartment_selected',
      'reserved'
    )
)
UPDATE "crm_deals" AS d
SET
  "status" = 'closed',
  "updated_at" = CURRENT_TIMESTAMP
FROM ranked_open_deals AS r
WHERE d.id = r.id
  AND r.rn > 1;

-- Partial unique: one open deal per builder company + buyer profile.
CREATE UNIQUE INDEX "crm_deals_company_buyer_open_key"
ON "crm_deals" ("company_id", "buyer_profile_id")
WHERE "buyer_profile_id" IS NOT NULL
  AND "status" IN (
    'new_request',
    'assigned',
    'contacted',
    'follow_up_needed',
    'apartment_selected',
    'reserved'
  );
