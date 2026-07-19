-- AlterEnum
BEGIN;
CREATE TYPE "CompanyMemberStatus_new" AS ENUM ('active', 'inactive', 'removed');
ALTER TABLE "public"."company_members" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "company_members" ALTER COLUMN "status" TYPE "CompanyMemberStatus_new" USING (
  CASE "status"::text
    WHEN 'disabled' THEN 'removed'
    WHEN 'invited' THEN 'active'
    WHEN 'active' THEN 'active'
    WHEN 'inactive' THEN 'inactive'
    WHEN 'removed' THEN 'removed'
    ELSE 'inactive'
  END
)::"CompanyMemberStatus_new";
ALTER TYPE "CompanyMemberStatus" RENAME TO "CompanyMemberStatus_old";
ALTER TYPE "CompanyMemberStatus_new" RENAME TO "CompanyMemberStatus";
DROP TYPE "public"."CompanyMemberStatus_old";
ALTER TABLE "company_members" ALTER COLUMN "status" SET DEFAULT 'active';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserStatus_new" AS ENUM ('invited', 'active', 'inactive', 'blocked');
ALTER TABLE "public"."users" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "status" TYPE "UserStatus_new" USING (
  CASE "status"::text
    WHEN 'suspended' THEN 'blocked'
    WHEN 'invited' THEN 'invited'
    WHEN 'active' THEN 'active'
    WHEN 'inactive' THEN 'inactive'
    WHEN 'blocked' THEN 'blocked'
    ELSE 'inactive'
  END
)::"UserStatus_new";
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "public"."UserStatus_old";
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'active';
COMMIT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;
