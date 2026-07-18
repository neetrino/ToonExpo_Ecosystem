import * as argon2 from "argon2";

/**
 * Hashes a plaintext password with argon2id.
 */
export const hashPassword = async (password: string): Promise<string> =>
  argon2.hash(password, { type: argon2.argon2id });

/**
 * Verifies a plaintext password against an argon2id hash.
 */
export const verifyPassword = async (
  hash: string,
  password: string,
): Promise<boolean> => {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
};
