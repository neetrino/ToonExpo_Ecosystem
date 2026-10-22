-- Deadline, priority, and status history for readiness criterion scores.

CREATE TYPE "ReadinessTaskPriority" AS ENUM ('low', 'medium', 'high', 'urgent');

ALTER TABLE "readiness_criterion_scores"
  ADD COLUMN "priority" "ReadinessTaskPriority" NOT NULL DEFAULT 'medium',
  ADD COLUMN "due_date" TIMESTAMP(3),
  ADD COLUMN "started_at" TIMESTAMP(3),
  ADD COLUMN "completed_at" TIMESTAMP(3),
  ADD COLUMN "status_changed_at" TIMESTAMP(3);

CREATE TABLE "readiness_criterion_status_events" (
    "id" TEXT NOT NULL,
    "criterion_score_id" TEXT NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "readiness_criterion_status_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "readiness_criterion_status_events_criterion_score_id_changed_at_idx"
  ON "readiness_criterion_status_events"("criterion_score_id", "changed_at");

ALTER TABLE "readiness_criterion_status_events"
  ADD CONSTRAINT "readiness_criterion_status_events_criterion_score_id_fkey"
  FOREIGN KEY ("criterion_score_id") REFERENCES "readiness_criterion_scores"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
