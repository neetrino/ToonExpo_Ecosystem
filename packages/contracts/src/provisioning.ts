import { z } from 'zod';

/** Roles that may be provisioned by an admin. BUYER is excluded — self-registration only. */
export const PROVISIONABLE_ROLES = [
  'BIGPROJECTS_ADMIN',
  'BUILDER',
  'PARTNER',
  'ENTRANCE_STAFF',
] as const;

export type ProvisionableRole = (typeof PROVISIONABLE_ROLES)[number];

const ROLES_REQUIRING_COMPANY: readonly ProvisionableRole[] = ['BUILDER', 'PARTNER'];

/**
 * Converts a company display name into a URL-safe slug: lowercase, non-alphanumerics
 * become hyphens, leading/trailing hyphens trimmed. Falls back to `company` when empty.
 */
export function slugifyCompanyName(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug.length > 0 ? slug : 'company';
}

export const provisionAccountSchema = z
  .object({
    email: z.string().trim().email().max(254),
    name: z.string().trim().min(1).max(120),
    role: z.enum(PROVISIONABLE_ROLES),
    companyName: z.string().trim().min(1).max(160).optional(),
    /** Optional Partner profile to link when role is PARTNER (manual v1; BOS later). */
    partnerId: z.string().trim().min(1).optional(),
  })
  .refine(
    (data) => {
      if (ROLES_REQUIRING_COMPANY.includes(data.role)) {
        return Boolean(data.companyName);
      }
      return true;
    },
    { path: ['companyName'] },
  )
  .refine(
    (data) => {
      if (data.partnerId) {
        return data.role === 'PARTNER';
      }
      return true;
    },
    { path: ['partnerId'] },
  );

export type ProvisionAccountInput = z.infer<typeof provisionAccountSchema>;
