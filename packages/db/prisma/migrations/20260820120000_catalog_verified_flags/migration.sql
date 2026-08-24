-- Admin/builder-controlled public "Verified" badge on catalog entities.

ALTER TABLE "projects" ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "buildings" ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "apartments" ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "projects_verified_idx" ON "projects"("verified");

CREATE INDEX "buildings_verified_idx" ON "buildings"("verified");

CREATE INDEX "apartments_verified_idx" ON "apartments"("verified");
