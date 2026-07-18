-- CreateEnum
CREATE TYPE "PartnerCompanyType" AS ENUM ('bank', 'it_company', 'sponsor', 'supplier', 'insurance', 'legal', 'design_furniture', 'service_company', 'other');

-- CreateEnum
CREATE TYPE "PartnerCompanyStatus" AS ENUM ('active', 'inactive');

-- CreateTable
CREATE TABLE "partner_companies" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "type" "PartnerCompanyType" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo_media_id" TEXT,
    "cover_media_id" TEXT,
    "short_description" TEXT,
    "full_description" TEXT,
    "contacts" JSONB,
    "website" TEXT,
    "social_links" JSONB,
    "status" "PartnerCompanyStatus" NOT NULL DEFAULT 'active',
    "publication_status" "PublicationStatus" NOT NULL DEFAULT 'draft',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_offers" (
    "id" TEXT NOT NULL,
    "partner_company_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "publication_status" "PublicationStatus" NOT NULL DEFAULT 'draft',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_offers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partner_companies_company_id_key" ON "partner_companies"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "partner_companies_slug_key" ON "partner_companies"("slug");

-- CreateIndex
CREATE INDEX "partner_companies_slug_idx" ON "partner_companies"("slug");

-- CreateIndex
CREATE INDEX "partner_companies_company_id_idx" ON "partner_companies"("company_id");

-- CreateIndex
CREATE INDEX "partner_companies_type_publication_status_idx" ON "partner_companies"("type", "publication_status");

-- CreateIndex
CREATE INDEX "partner_offers_partner_company_id_idx" ON "partner_offers"("partner_company_id");

-- CreateIndex
CREATE INDEX "partner_offers_publication_status_idx" ON "partner_offers"("publication_status");

-- AddForeignKey
ALTER TABLE "partner_companies" ADD CONSTRAINT "partner_companies_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_companies" ADD CONSTRAINT "partner_companies_logo_media_id_fkey" FOREIGN KEY ("logo_media_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_companies" ADD CONSTRAINT "partner_companies_cover_media_id_fkey" FOREIGN KEY ("cover_media_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_offers" ADD CONSTRAINT "partner_offers_partner_company_id_fkey" FOREIGN KEY ("partner_company_id") REFERENCES "partner_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
