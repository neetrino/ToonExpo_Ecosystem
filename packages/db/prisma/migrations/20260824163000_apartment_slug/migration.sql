-- Apartment public URL slugs (globally unique, backfilled from project slug + unit number).

ALTER TABLE "apartments" ADD COLUMN "slug" TEXT;

UPDATE "apartments" AS a
SET "slug" = CONCAT(
  p."slug",
  '-unit-',
  COALESCE(
    NULLIF(
      regexp_replace(
        regexp_replace(lower(trim(a."number")), '[^a-z0-9]+', '-', 'g'),
        '(^-+|-+$)',
        '',
        'g'
      ),
      ''
    ),
    'apt'
  ),
  '-',
  right(a."id", 6)
)
FROM "projects" AS p
WHERE p."id" = a."project_id";

ALTER TABLE "apartments" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "apartments_slug_key" ON "apartments"("slug");
