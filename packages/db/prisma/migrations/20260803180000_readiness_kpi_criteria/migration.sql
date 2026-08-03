-- Nested KPI criteria for Builder Readiness (Toon Admin–style checklist).

ALTER TABLE "readiness_categories" ADD COLUMN "code" TEXT;

UPDATE "readiness_categories"
SET "code" = 'legacy_' || "id"
WHERE "code" IS NULL;

ALTER TABLE "readiness_categories" ALTER COLUMN "code" SET NOT NULL;

CREATE UNIQUE INDEX "readiness_categories_code_key" ON "readiness_categories"("code");

CREATE TABLE "readiness_criteria" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "max_points" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "readiness_criteria_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "readiness_criterion_scores" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "criterion_id" TEXT NOT NULL,
    "value" INTEGER,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "readiness_criterion_scores_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "readiness_criteria_code_key" ON "readiness_criteria"("code");
CREATE INDEX "readiness_criteria_category_id_idx" ON "readiness_criteria"("category_id");
CREATE INDEX "readiness_criteria_parent_id_idx" ON "readiness_criteria"("parent_id");
CREATE INDEX "readiness_criteria_active_sort_order_idx" ON "readiness_criteria"("active", "sort_order");

CREATE UNIQUE INDEX "readiness_criterion_scores_assessment_id_criterion_id_key" ON "readiness_criterion_scores"("assessment_id", "criterion_id");
CREATE INDEX "readiness_criterion_scores_assessment_id_idx" ON "readiness_criterion_scores"("assessment_id");
CREATE INDEX "readiness_criterion_scores_criterion_id_idx" ON "readiness_criterion_scores"("criterion_id");

ALTER TABLE "readiness_criteria" ADD CONSTRAINT "readiness_criteria_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "readiness_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "readiness_criteria" ADD CONSTRAINT "readiness_criteria_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "readiness_criteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "readiness_criterion_scores" ADD CONSTRAINT "readiness_criterion_scores_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "readiness_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "readiness_criterion_scores" ADD CONSTRAINT "readiness_criterion_scores_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "readiness_criteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
