-- Admin-curated homepage featured projects (max 3) and apartments (max 6).

ALTER TABLE "projects" ADD COLUMN "featured_on_home" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "apartments" ADD COLUMN "featured_on_home" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "projects_featured_on_home_idx" ON "projects"("featured_on_home");

CREATE INDEX "apartments_featured_on_home_idx" ON "apartments"("featured_on_home");
