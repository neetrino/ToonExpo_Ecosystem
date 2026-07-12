-- Platform settings (v1) + audit extensions for settings changes.
-- Docs: 13-Admin-Content-Management/05-Settings-Languages-And-Dictionaries.

ALTER TYPE "AuditAction" ADD VALUE 'SETTINGS_UPDATE';

ALTER TYPE "AuditEntityType" ADD VALUE 'PLATFORM_SETTING';

CREATE TABLE "PlatformSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedByUserId" TEXT,

    CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PlatformSetting_key_key" ON "PlatformSetting"("key");

ALTER TABLE "PlatformSetting" ADD CONSTRAINT "PlatformSetting_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
