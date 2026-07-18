-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "ApartmentSalesStatus" AS ENUM ('available', 'reserved', 'sold');

-- CreateEnum
CREATE TYPE "PriceVisibility" AS ENUM ('public', 'by_request', 'hidden', 'visible_after_login');

-- CreateEnum
CREATE TYPE "CrmStatusSource" AS ENUM ('manual', 'crm', 'import');

-- CreateEnum
CREATE TYPE "MediaAssetType" AS ENUM ('image', 'video', 'document', 'other');

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "logo_media_id" TEXT;

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "owner_company_id" TEXT,
    "related_entity_type" TEXT,
    "related_entity_id" TEXT,
    "type" "MediaAssetType" NOT NULL,
    "file_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "title" TEXT,
    "alt_text" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "uploaded_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "builder_company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "publication_status" "PublicationStatus" NOT NULL DEFAULT 'draft',
    "short_description" TEXT,
    "full_description" TEXT,
    "location_text" TEXT,
    "address" TEXT,
    "city" TEXT,
    "district" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "cover_media_id" TEXT,
    "project_type" TEXT,
    "construction_status" TEXT,
    "completion_date" DATE,
    "amenities" JSONB,
    "nearby_places" JSONB,
    "created_by_user_id" TEXT,
    "updated_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buildings" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "publication_status" "PublicationStatus" NOT NULL DEFAULT 'draft',
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "floors_count" INTEGER,
    "cover_media_id" TEXT,
    "internal_code" TEXT,
    "created_by_user_id" TEXT,
    "updated_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "floors" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "publication_status" "PublicationStatus" NOT NULL DEFAULT 'draft',
    "name" TEXT,
    "display_label" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "floorplan_media_id" TEXT,
    "description" TEXT,
    "created_by_user_id" TEXT,
    "updated_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "floors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apartments" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "floor_id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "sales_status" "ApartmentSalesStatus" NOT NULL DEFAULT 'available',
    "publication_status" "PublicationStatus" NOT NULL DEFAULT 'draft',
    "rooms" INTEGER,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "area_total" DECIMAL(10,2),
    "area_living" DECIMAL(10,2),
    "balcony_area" DECIMAL(10,2),
    "price" DECIMAL(14,2),
    "price_currency" TEXT NOT NULL DEFAULT 'AMD',
    "price_visibility" "PriceVisibility" NOT NULL DEFAULT 'public',
    "description" TEXT,
    "plan_media_id" TEXT,
    "matterport_url" TEXT,
    "external_3d_url" TEXT,
    "orientation" TEXT,
    "view_type" TEXT,
    "features" JSONB,
    "crm_status_source" "CrmStatusSource" NOT NULL DEFAULT 'manual',
    "active_crm_deal_id" TEXT,
    "reserved_until" TIMESTAMP(3),
    "last_status_changed_at" TIMESTAMP(3),
    "last_status_changed_by_user_id" TEXT,
    "internal_code" TEXT,
    "import_external_id" TEXT,
    "created_by_user_id" TEXT,
    "updated_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apartments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apartment_status_history" (
    "id" TEXT NOT NULL,
    "apartment_id" TEXT NOT NULL,
    "previous_status" "ApartmentSalesStatus",
    "new_status" "ApartmentSalesStatus" NOT NULL,
    "reason" TEXT,
    "changed_by_user_id" TEXT,
    "linked_deal_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "apartment_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "media_assets_owner_company_id_idx" ON "media_assets"("owner_company_id");

-- CreateIndex
CREATE INDEX "media_assets_related_entity_type_related_entity_id_idx" ON "media_assets"("related_entity_type", "related_entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE INDEX "projects_builder_company_id_idx" ON "projects"("builder_company_id");

-- CreateIndex
CREATE INDEX "projects_publication_status_idx" ON "projects"("publication_status");

-- CreateIndex
CREATE INDEX "projects_city_idx" ON "projects"("city");

-- CreateIndex
CREATE INDEX "buildings_project_id_idx" ON "buildings"("project_id");

-- CreateIndex
CREATE INDEX "buildings_publication_status_idx" ON "buildings"("publication_status");

-- CreateIndex
CREATE UNIQUE INDEX "buildings_project_id_name_key" ON "buildings"("project_id", "name");

-- CreateIndex
CREATE INDEX "floors_building_id_idx" ON "floors"("building_id");

-- CreateIndex
CREATE INDEX "floors_publication_status_idx" ON "floors"("publication_status");

-- CreateIndex
CREATE UNIQUE INDEX "floors_building_id_number_key" ON "floors"("building_id", "number");

-- CreateIndex
CREATE INDEX "apartments_project_id_idx" ON "apartments"("project_id");

-- CreateIndex
CREATE INDEX "apartments_building_id_idx" ON "apartments"("building_id");

-- CreateIndex
CREATE INDEX "apartments_floor_id_idx" ON "apartments"("floor_id");

-- CreateIndex
CREATE INDEX "apartments_publication_status_idx" ON "apartments"("publication_status");

-- CreateIndex
CREATE INDEX "apartments_sales_status_idx" ON "apartments"("sales_status");

-- CreateIndex
CREATE INDEX "apartments_price_idx" ON "apartments"("price");

-- CreateIndex
CREATE INDEX "apartments_rooms_idx" ON "apartments"("rooms");

-- CreateIndex
CREATE INDEX "apartments_publication_status_sales_status_idx" ON "apartments"("publication_status", "sales_status");

-- CreateIndex
CREATE INDEX "apartments_project_id_publication_status_idx" ON "apartments"("project_id", "publication_status");

-- CreateIndex
CREATE UNIQUE INDEX "apartments_floor_id_number_key" ON "apartments"("floor_id", "number");

-- CreateIndex
CREATE INDEX "apartment_status_history_apartment_id_idx" ON "apartment_status_history"("apartment_id");

-- CreateIndex
CREATE INDEX "apartment_status_history_created_at_idx" ON "apartment_status_history"("created_at");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_logo_media_id_fkey" FOREIGN KEY ("logo_media_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_owner_company_id_fkey" FOREIGN KEY ("owner_company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_builder_company_id_fkey" FOREIGN KEY ("builder_company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_cover_media_id_fkey" FOREIGN KEY ("cover_media_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_cover_media_id_fkey" FOREIGN KEY ("cover_media_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "floors" ADD CONSTRAINT "floors_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "floors" ADD CONSTRAINT "floors_floorplan_media_id_fkey" FOREIGN KEY ("floorplan_media_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apartments" ADD CONSTRAINT "apartments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apartments" ADD CONSTRAINT "apartments_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apartments" ADD CONSTRAINT "apartments_floor_id_fkey" FOREIGN KEY ("floor_id") REFERENCES "floors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apartments" ADD CONSTRAINT "apartments_plan_media_id_fkey" FOREIGN KEY ("plan_media_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apartment_status_history" ADD CONSTRAINT "apartment_status_history_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "apartments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
