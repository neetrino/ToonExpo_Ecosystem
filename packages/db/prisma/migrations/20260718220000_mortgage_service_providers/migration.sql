-- CreateEnum
CREATE TYPE "ServiceProviderType" AS ENUM ('company', 'person', 'team', 'other');

-- CreateTable
CREATE TABLE "bank_offers" (
    "id" TEXT NOT NULL,
    "partner_company_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "short_description" TEXT,
    "rate" DECIMAL(5,2) NOT NULL,
    "apr" DECIMAL(5,2),
    "min_down_payment_percent" DECIMAL(5,2) NOT NULL,
    "term_options_years" INTEGER[],
    "fees" TEXT,
    "calculation_notes" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "publication_status" "PublicationStatus" NOT NULL DEFAULT 'draft',
    "created_by_user_id" TEXT NOT NULL,
    "updated_by_user_id" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_provider_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_provider_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_providers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider_type" "ServiceProviderType" NOT NULL,
    "description" TEXT,
    "services" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "social_links" JSONB,
    "internal_notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "publication_status" "PublicationStatus",
    "created_by_user_id" TEXT NOT NULL,
    "updated_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_provider_category_links" (
    "service_provider_id" TEXT NOT NULL,
    "service_provider_category_id" TEXT NOT NULL,

    CONSTRAINT "service_provider_category_links_pkey" PRIMARY KEY ("service_provider_id","service_provider_category_id")
);

-- CreateIndex
CREATE INDEX "bank_offers_partner_company_id_idx" ON "bank_offers"("partner_company_id");

-- CreateIndex
CREATE INDEX "bank_offers_publication_status_idx" ON "bank_offers"("publication_status");

-- CreateIndex
CREATE INDEX "service_provider_categories_active_idx" ON "service_provider_categories"("active");

-- CreateIndex
CREATE INDEX "service_provider_categories_sort_order_idx" ON "service_provider_categories"("sort_order");

-- CreateIndex
CREATE INDEX "service_providers_active_idx" ON "service_providers"("active");

-- CreateIndex
CREATE INDEX "service_providers_provider_type_idx" ON "service_providers"("provider_type");

-- CreateIndex
CREATE INDEX "service_providers_publication_status_idx" ON "service_providers"("publication_status");

-- CreateIndex
CREATE INDEX "service_provider_category_links_service_provider_category_i_idx" ON "service_provider_category_links"("service_provider_category_id");

-- CreateIndex
CREATE INDEX "readiness_categories_service_provider_category_id_idx" ON "readiness_categories"("service_provider_category_id");

-- AddForeignKey
ALTER TABLE "readiness_categories" ADD CONSTRAINT "readiness_categories_service_provider_category_id_fkey" FOREIGN KEY ("service_provider_category_id") REFERENCES "service_provider_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_offers" ADD CONSTRAINT "bank_offers_partner_company_id_fkey" FOREIGN KEY ("partner_company_id") REFERENCES "partner_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_offers" ADD CONSTRAINT "bank_offers_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_offers" ADD CONSTRAINT "bank_offers_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_providers" ADD CONSTRAINT "service_providers_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_providers" ADD CONSTRAINT "service_providers_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_provider_category_links" ADD CONSTRAINT "service_provider_category_links_service_provider_id_fkey" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_provider_category_links" ADD CONSTRAINT "service_provider_category_links_service_provider_category__fkey" FOREIGN KEY ("service_provider_category_id") REFERENCES "service_provider_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
