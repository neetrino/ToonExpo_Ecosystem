-- Sprint 7.5 — Admin acting-on-behalf audit actions + COMPANY entity type.

ALTER TYPE "AuditAction" ADD VALUE 'ACTING_ON_BEHALF_START';
ALTER TYPE "AuditAction" ADD VALUE 'ACTING_ON_BEHALF_STOP';

ALTER TYPE "AuditEntityType" ADD VALUE 'COMPANY';
