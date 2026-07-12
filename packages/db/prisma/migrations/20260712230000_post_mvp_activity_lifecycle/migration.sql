-- CRM follow-up activity lifecycle (doc 09-Constructor-CRM/05).
CREATE TYPE "ActivityStatus" AS ENUM ('PLANNED', 'DONE', 'CANCELLED');

ALTER TABLE "DealActivity" ADD COLUMN "status" "ActivityStatus";
ALTER TABLE "DealActivity" ADD COLUMN "dueAt" TIMESTAMP(3);
ALTER TABLE "DealActivity" ADD COLUMN "completedAt" TIMESTAMP(3);
