import { z } from 'zod';

export const SLUG_MAX_LENGTH = 100;

/** URL-safe slug: lowercase letters, digits, and hyphens (no leading/trailing hyphen). */
export const slugSchema = z
  .string()
  .max(SLUG_MAX_LENGTH)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
