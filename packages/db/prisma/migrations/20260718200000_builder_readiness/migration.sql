-- CreateEnum
CREATE TYPE "ReadinessAssessmentTargetType" AS ENUM ('builder_company', 'project');

-- CreateEnum
CREATE TYPE "ReadinessScoreStatus" AS ENUM ('not_started', 'needs_improvement', 'in_progress', 'ready', 'blocked');

-- CreateEnum
CREATE TYPE "ReadinessVisibility" AS ENUM ('builder_visible', 'internal_only');

-- CreateEnum
CREATE TYPE "ReadinessRequiredActionStatus" AS ENUM ('open', 'in_progress', 'done', 'blocked', 'cancelled');

-- CreateTable
CREATE TABLE "readiness_assessments" (
    "id" TEXT NOT NULL,
    "target_type" "ReadinessAssessmentTargetType" NOT NULL,
    "builder_company_id" TEXT NOT NULL,
    "project_id" TEXT,
    "status" "ReadinessScoreStatus" NOT NULL DEFAULT 'not_started',
    "overall_score" INTEGER,
    "overall_score_overridden" BOOLEAN NOT NULL DEFAULT false,
    "evaluated_by_user_id" TEXT,
    "last_evaluated_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "readiness_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "readiness_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "weight" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "service_provider_category_id" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "readiness_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "readiness_scores" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "score" INTEGER,
    "status" "ReadinessScoreStatus" NOT NULL DEFAULT 'not_started',
    "recommendation_summary" TEXT,
    "evaluated_by_user_id" TEXT,
    "evaluated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "readiness_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "readiness_recommendations" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "score_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "visibility" "ReadinessVisibility" NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_by_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "readiness_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "readiness_required_actions" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "score_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "ReadinessRequiredActionStatus" NOT NULL DEFAULT 'open',
    "related_entity_type" TEXT,
    "related_entity_id" TEXT,
    "visibility" "ReadinessVisibility" NOT NULL,
    "created_by_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "readiness_required_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "readiness_internal_notes" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "score_id" TEXT,
    "author_user_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "readiness_internal_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "readiness_assessments_builder_company_id_idx" ON "readiness_assessments"("builder_company_id");

-- CreateIndex
CREATE INDEX "readiness_assessments_project_id_idx" ON "readiness_assessments"("project_id");

-- CreateIndex
CREATE INDEX "readiness_assessments_status_idx" ON "readiness_assessments"("status");

-- CreateIndex
CREATE INDEX "readiness_assessments_builder_company_id_target_type_archiv_idx" ON "readiness_assessments"("builder_company_id", "target_type", "archived_at");

-- CreateIndex
CREATE INDEX "readiness_assessments_project_id_archived_at_idx" ON "readiness_assessments"("project_id", "archived_at");

-- CreateIndex
CREATE INDEX "readiness_categories_active_idx" ON "readiness_categories"("active");

-- CreateIndex
CREATE INDEX "readiness_categories_sort_order_idx" ON "readiness_categories"("sort_order");

-- CreateIndex
CREATE INDEX "readiness_scores_assessment_id_idx" ON "readiness_scores"("assessment_id");

-- CreateIndex
CREATE INDEX "readiness_scores_category_id_idx" ON "readiness_scores"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "readiness_scores_assessment_id_category_id_key" ON "readiness_scores"("assessment_id", "category_id");

-- CreateIndex
CREATE INDEX "readiness_recommendations_assessment_id_idx" ON "readiness_recommendations"("assessment_id");

-- CreateIndex
CREATE INDEX "readiness_recommendations_score_id_idx" ON "readiness_recommendations"("score_id");

-- CreateIndex
CREATE INDEX "readiness_recommendations_visibility_idx" ON "readiness_recommendations"("visibility");

-- CreateIndex
CREATE INDEX "readiness_required_actions_assessment_id_idx" ON "readiness_required_actions"("assessment_id");

-- CreateIndex
CREATE INDEX "readiness_required_actions_score_id_idx" ON "readiness_required_actions"("score_id");

-- CreateIndex
CREATE INDEX "readiness_required_actions_status_idx" ON "readiness_required_actions"("status");

-- CreateIndex
CREATE INDEX "readiness_required_actions_visibility_idx" ON "readiness_required_actions"("visibility");

-- CreateIndex
CREATE INDEX "readiness_internal_notes_assessment_id_idx" ON "readiness_internal_notes"("assessment_id");

-- CreateIndex
CREATE INDEX "readiness_internal_notes_score_id_idx" ON "readiness_internal_notes"("score_id");

-- CreateIndex
CREATE INDEX "readiness_internal_notes_author_user_id_idx" ON "readiness_internal_notes"("author_user_id");

-- AddForeignKey
ALTER TABLE "readiness_assessments" ADD CONSTRAINT "readiness_assessments_builder_company_id_fkey" FOREIGN KEY ("builder_company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readiness_assessments" ADD CONSTRAINT "readiness_assessments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readiness_assessments" ADD CONSTRAINT "readiness_assessments_evaluated_by_user_id_fkey" FOREIGN KEY ("evaluated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readiness_scores" ADD CONSTRAINT "readiness_scores_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "readiness_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readiness_scores" ADD CONSTRAINT "readiness_scores_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "readiness_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readiness_scores" ADD CONSTRAINT "readiness_scores_evaluated_by_user_id_fkey" FOREIGN KEY ("evaluated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readiness_recommendations" ADD CONSTRAINT "readiness_recommendations_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "readiness_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readiness_recommendations" ADD CONSTRAINT "readiness_recommendations_score_id_fkey" FOREIGN KEY ("score_id") REFERENCES "readiness_scores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readiness_recommendations" ADD CONSTRAINT "readiness_recommendations_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readiness_required_actions" ADD CONSTRAINT "readiness_required_actions_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "readiness_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readiness_required_actions" ADD CONSTRAINT "readiness_required_actions_score_id_fkey" FOREIGN KEY ("score_id") REFERENCES "readiness_scores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readiness_required_actions" ADD CONSTRAINT "readiness_required_actions_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readiness_internal_notes" ADD CONSTRAINT "readiness_internal_notes_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "readiness_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readiness_internal_notes" ADD CONSTRAINT "readiness_internal_notes_score_id_fkey" FOREIGN KEY ("score_id") REFERENCES "readiness_scores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readiness_internal_notes" ADD CONSTRAINT "readiness_internal_notes_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
