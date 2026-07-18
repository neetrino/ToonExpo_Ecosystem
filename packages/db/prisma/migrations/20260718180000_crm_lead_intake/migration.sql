-- CreateEnum
CREATE TYPE "RequestSource" AS ENUM ('buyer_project_request', 'builder_buyer_qr_scan', 'manual_builder_entry', 'event_interaction');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('submitted', 'attached', 'cancelled');

-- CreateEnum
CREATE TYPE "CrmDealStatus" AS ENUM ('new_request', 'assigned', 'contacted', 'follow_up_needed', 'apartment_selected', 'reserved', 'converted', 'closed', 'lost');

-- CreateEnum
CREATE TYPE "CrmDealApartmentLinkType" AS ENUM ('interest', 'selected', 'reserved', 'sold');

-- CreateEnum
CREATE TYPE "CrmNoteVisibility" AS ENUM ('internal');

-- CreateEnum
CREATE TYPE "CrmActivityType" AS ENUM ('call', 'email', 'meeting', 'send_offer', 'follow_up', 'status_update', 'other');

-- CreateEnum
CREATE TYPE "CrmActivityStatus" AS ENUM ('planned', 'done', 'cancelled');

-- CreateTable
CREATE TABLE "requests" (
    "id" TEXT NOT NULL,
    "buyer_profile_id" TEXT,
    "builder_company_id" TEXT NOT NULL,
    "project_id" TEXT,
    "apartment_id" TEXT,
    "source" "RequestSource" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'submitted',
    "note" TEXT,
    "scan_event_id" TEXT,
    "created_by_user_id" TEXT,
    "crm_deal_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_deals" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "buyer_profile_id" TEXT,
    "primary_request_id" TEXT,
    "source" "RequestSource" NOT NULL,
    "status" "CrmDealStatus" NOT NULL DEFAULT 'new_request',
    "title" TEXT,
    "message" TEXT,
    "contact_name" TEXT,
    "contact_phone" TEXT,
    "contact_email" TEXT,
    "assigned_user_id" TEXT,
    "created_by_user_id" TEXT,
    "lost_reason" TEXT,
    "last_activity_at" TIMESTAMP(3),
    "next_follow_up_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "project_id" TEXT,

    CONSTRAINT "crm_deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_deal_apartment_links" (
    "id" TEXT NOT NULL,
    "crm_deal_id" TEXT NOT NULL,
    "apartment_id" TEXT NOT NULL,
    "link_type" "CrmDealApartmentLinkType" NOT NULL DEFAULT 'interest',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "apartment_sales_status_at_link" "ApartmentSalesStatus",
    "price_at_link" DECIMAL(14,2),
    "price_visibility_at_link" "PriceVisibility",
    "created_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_deal_apartment_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_notes" (
    "id" TEXT NOT NULL,
    "crm_deal_id" TEXT NOT NULL,
    "author_user_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "visibility" "CrmNoteVisibility" NOT NULL DEFAULT 'internal',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_follow_up_activities" (
    "id" TEXT NOT NULL,
    "crm_deal_id" TEXT NOT NULL,
    "type" "CrmActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "due_at" TIMESTAMP(3),
    "status" "CrmActivityStatus" NOT NULL DEFAULT 'planned',
    "assigned_user_id" TEXT,
    "created_by_user_id" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_follow_up_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "requests_buyer_profile_id_idx" ON "requests"("buyer_profile_id");

-- CreateIndex
CREATE INDEX "requests_builder_company_id_idx" ON "requests"("builder_company_id");

-- CreateIndex
CREATE INDEX "requests_project_id_idx" ON "requests"("project_id");

-- CreateIndex
CREATE INDEX "requests_apartment_id_idx" ON "requests"("apartment_id");

-- CreateIndex
CREATE INDEX "requests_source_idx" ON "requests"("source");

-- CreateIndex
CREATE INDEX "requests_status_idx" ON "requests"("status");

-- CreateIndex
CREATE INDEX "requests_crm_deal_id_idx" ON "requests"("crm_deal_id");

-- CreateIndex
CREATE INDEX "requests_scan_event_id_idx" ON "requests"("scan_event_id");

-- CreateIndex
CREATE INDEX "requests_created_at_idx" ON "requests"("created_at");

-- CreateIndex
CREATE INDEX "crm_deals_company_id_idx" ON "crm_deals"("company_id");

-- CreateIndex
CREATE INDEX "crm_deals_buyer_profile_id_idx" ON "crm_deals"("buyer_profile_id");

-- CreateIndex
CREATE INDEX "crm_deals_status_idx" ON "crm_deals"("status");

-- CreateIndex
CREATE INDEX "crm_deals_source_idx" ON "crm_deals"("source");

-- CreateIndex
CREATE INDEX "crm_deals_project_id_idx" ON "crm_deals"("project_id");

-- CreateIndex
CREATE INDEX "crm_deals_assigned_user_id_idx" ON "crm_deals"("assigned_user_id");

-- CreateIndex
CREATE INDEX "crm_deals_updated_at_idx" ON "crm_deals"("updated_at");

-- CreateIndex
CREATE INDEX "crm_deals_company_id_buyer_profile_id_status_idx" ON "crm_deals"("company_id", "buyer_profile_id", "status");

-- CreateIndex
CREATE INDEX "crm_deal_apartment_links_crm_deal_id_idx" ON "crm_deal_apartment_links"("crm_deal_id");

-- CreateIndex
CREATE INDEX "crm_deal_apartment_links_apartment_id_idx" ON "crm_deal_apartment_links"("apartment_id");

-- CreateIndex
CREATE UNIQUE INDEX "crm_deal_apartment_links_crm_deal_id_apartment_id_key" ON "crm_deal_apartment_links"("crm_deal_id", "apartment_id");

-- CreateIndex
CREATE INDEX "crm_notes_crm_deal_id_idx" ON "crm_notes"("crm_deal_id");

-- CreateIndex
CREATE INDEX "crm_notes_author_user_id_idx" ON "crm_notes"("author_user_id");

-- CreateIndex
CREATE INDEX "crm_notes_created_at_idx" ON "crm_notes"("created_at");

-- CreateIndex
CREATE INDEX "crm_follow_up_activities_crm_deal_id_idx" ON "crm_follow_up_activities"("crm_deal_id");

-- CreateIndex
CREATE INDEX "crm_follow_up_activities_status_idx" ON "crm_follow_up_activities"("status");

-- CreateIndex
CREATE INDEX "crm_follow_up_activities_due_at_idx" ON "crm_follow_up_activities"("due_at");

-- CreateIndex
CREATE INDEX "crm_follow_up_activities_assigned_user_id_idx" ON "crm_follow_up_activities"("assigned_user_id");

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_buyer_profile_id_fkey" FOREIGN KEY ("buyer_profile_id") REFERENCES "buyer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_builder_company_id_fkey" FOREIGN KEY ("builder_company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "apartments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_scan_event_id_fkey" FOREIGN KEY ("scan_event_id") REFERENCES "qr_scan_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_crm_deal_id_fkey" FOREIGN KEY ("crm_deal_id") REFERENCES "crm_deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_deals" ADD CONSTRAINT "crm_deals_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_deals" ADD CONSTRAINT "crm_deals_buyer_profile_id_fkey" FOREIGN KEY ("buyer_profile_id") REFERENCES "buyer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_deals" ADD CONSTRAINT "crm_deals_primary_request_id_fkey" FOREIGN KEY ("primary_request_id") REFERENCES "requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_deals" ADD CONSTRAINT "crm_deals_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_deals" ADD CONSTRAINT "crm_deals_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_deals" ADD CONSTRAINT "crm_deals_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_deal_apartment_links" ADD CONSTRAINT "crm_deal_apartment_links_crm_deal_id_fkey" FOREIGN KEY ("crm_deal_id") REFERENCES "crm_deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_deal_apartment_links" ADD CONSTRAINT "crm_deal_apartment_links_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "apartments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_deal_apartment_links" ADD CONSTRAINT "crm_deal_apartment_links_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_notes" ADD CONSTRAINT "crm_notes_crm_deal_id_fkey" FOREIGN KEY ("crm_deal_id") REFERENCES "crm_deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_notes" ADD CONSTRAINT "crm_notes_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_follow_up_activities" ADD CONSTRAINT "crm_follow_up_activities_crm_deal_id_fkey" FOREIGN KEY ("crm_deal_id") REFERENCES "crm_deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_follow_up_activities" ADD CONSTRAINT "crm_follow_up_activities_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_follow_up_activities" ADD CONSTRAINT "crm_follow_up_activities_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
