-- AlterTable
ALTER TABLE "companies" ADD COLUMN "short_description" TEXT;

-- Backfill card text from the existing full description so public cards stay populated.
UPDATE "companies"
SET "short_description" = LEFT("description", 400)
WHERE "description" IS NOT NULL
  AND "short_description" IS NULL;
