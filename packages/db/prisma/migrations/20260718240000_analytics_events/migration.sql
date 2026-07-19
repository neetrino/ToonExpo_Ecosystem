-- CreateEnum
CREATE TYPE "analytics_event_type" AS ENUM ('project_view', 'building_view', 'floor_view', 'apartment_view', 'builder_profile_view', 'partner_profile_view', 'mortgage_page_view', 'bank_offer_selected', 'favorite_added', 'request_created', 'qr_scanned', 'check_in_recorded', 'booth_selected', 'route_requested', 'crm_status_changed', 'readiness_status_changed');

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "event_type" "analytics_event_type" NOT NULL,
    "actor_user_id" TEXT,
    "actor_role" TEXT,
    "company_id" TEXT,
    "project_id" TEXT,
    "building_id" TEXT,
    "floor_id" TEXT,
    "apartment_id" TEXT,
    "event_id" TEXT,
    "booth_id" TEXT,
    "request_id" TEXT,
    "crm_deal_id" TEXT,
    "source" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analytics_events_event_type_created_at_idx" ON "analytics_events"("event_type", "created_at");

-- CreateIndex
CREATE INDEX "analytics_events_company_id_created_at_idx" ON "analytics_events"("company_id", "created_at");

-- CreateIndex
CREATE INDEX "analytics_events_project_id_created_at_idx" ON "analytics_events"("project_id", "created_at");
