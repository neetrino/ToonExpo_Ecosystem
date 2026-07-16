import { randomUUID } from 'node:crypto';

import { MAX_SLUG_ATTEMPTS, UUID_SLUG_SUFFIX_LENGTH } from './bos-provisioning.constants';

/**
 * Allocates a unique slug from `baseSlug`, trying numeric suffixes then a short UUID.
 * Mirrors apps/web unique-slug semantics for equivalent company/partner creation.
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
