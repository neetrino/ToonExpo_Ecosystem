import argon2 from 'argon2';

/** Argon2id is the recommended password hashing variant (side-channel + GPU resistant). */
const HASH_OPTIONS = { type: argon2.argon2id } as const;

export function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, HASH_OPTIONS);
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    // A malformed or non-argon2 hash must never authenticate the user.
    return false;
  }
}
