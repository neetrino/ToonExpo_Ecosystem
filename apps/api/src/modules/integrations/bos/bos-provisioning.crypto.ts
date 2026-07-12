import { randomBytes, randomUUID } from 'node:crypto';

import argon2 from 'argon2';

import {
  MAX_SLUG_ATTEMPTS,
  UNUSABLE_PASSWORD_BYTES,
  UUID_SLUG_SUFFIX_LENGTH,
} from './bos-provisioning.constants';

const HASH_OPTIONS = { type: argon2.argon2id } as const;

/**
 * Hashes a random unusable password for BOS-provisioned users.
 * Invitation / password-setup email is deferred (same as admin provision TODO).
 */
export async function hashUnusablePassword(): Promise<string> {
  const plain = randomBytes(UNUSABLE_PASSWORD_BYTES).toString('hex');
  return argon2.hash(plain, HASH_OPTIONS);
}

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
