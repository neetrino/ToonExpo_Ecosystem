-- AlterEnum: drop unused `hidden` from PriceVisibility (map existing rows to by_request)
UPDATE "apartments" SET "price_visibility" = 'by_request' WHERE "price_visibility" = 'hidden';

CREATE TYPE "PriceVisibility_new" AS ENUM ('public', 'by_request', 'visible_after_login');

ALTER TABLE "apartments" ALTER COLUMN "price_visibility" DROP DEFAULT;
ALTER TABLE "apartments"
  ALTER COLUMN "price_visibility" TYPE "PriceVisibility_new"
  USING ("price_visibility"::text::"PriceVisibility_new");

DROP TYPE "PriceVisibility";
ALTER TYPE "PriceVisibility_new" RENAME TO "PriceVisibility";

ALTER TABLE "apartments" ALTER COLUMN "price_visibility" SET DEFAULT 'public'::"PriceVisibility";

-- AlterTable
ALTER TABLE "companies" ADD COLUMN "description" TEXT;

-- CreateTable
CREATE TABLE "translations" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "field_name" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "translations_entity_type_entity_id_idx" ON "translations"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "translations_locale_idx" ON "translations"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "translations_entity_type_entity_id_field_name_locale_key" ON "translations"("entity_type", "entity_id", "field_name", "locale");
