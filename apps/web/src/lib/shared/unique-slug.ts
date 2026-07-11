import { randomUUID } from 'node:crypto';

export const MAX_SLUG_ATTEMPTS = 50;
export const UUID_SLUG_SUFFIX_LENGTH = 8;

/**
 * Allocates a unique slug from `baseSlug`, trying numeric suffixes then a
 * short UUID suffix. Returns null when every candidate is taken.
 */
export async function allocateUniqueSlug(
  baseSlug: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string | null> {
  for (let suffix = 0; suffix < MAX_SLUG_ATTEMPTS; suffix += 1) {
    const slug = suffix === 0 ? baseSlug : `${baseSlug}-${suffix}`;
    if (!(await isTaken(slug))) {
      return slug;
    }
  }

  const fallbackSlug = `${baseSlug}-${randomUUID().slice(0, UUID_SLUG_SUFFIX_LENGTH)}`;
  if (!(await isTaken(fallbackSlug))) {
    return fallbackSlug;
  }

  return null;
}
