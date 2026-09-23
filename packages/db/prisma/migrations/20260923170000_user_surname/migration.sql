ALTER TABLE "users" ADD COLUMN "surname" TEXT;
ALTER TABLE "buyer_profiles" ADD COLUMN "surname" TEXT;

-- Existing accounts stored "Name Surname" in a single column.
UPDATE "users"
SET
  "surname" = BTRIM(SUBSTRING("name" FROM POSITION(' ' IN "name") + 1)),
  "name" = BTRIM(SUBSTRING("name" FROM 1 FOR POSITION(' ' IN "name") - 1))
WHERE POSITION(' ' IN "name") > 1;

UPDATE "buyer_profiles"
SET
  "surname" = BTRIM(SUBSTRING("name" FROM POSITION(' ' IN "name") + 1)),
  "name" = BTRIM(SUBSTRING("name" FROM 1 FOR POSITION(' ' IN "name") - 1))
WHERE POSITION(' ' IN "name") > 1;
