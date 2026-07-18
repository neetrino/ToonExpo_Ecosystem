import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

/** Opaque QR token entropy (≥256 bits). */
export const QR_TOKEN_BYTES = 32;

const QR_ENC_IV_BYTES = 12;
const QR_ENC_TAG_BYTES = 16;

/**
 * Creates a cryptographically random opaque QR token (≥256 bits).
 */
export const createQrToken = (): string =>
  randomBytes(QR_TOKEN_BYTES).toString("base64url");

/**
 * Hashes a raw QR token with the server pepper (SHA-256 of pepper:token).
 */
export const hashQrToken = (token: string, pepper: string): string =>
  createHash("sha256").update(`${pepper}:${token}`).digest("hex");

const deriveEncryptionKey = (pepper: string): Buffer =>
  createHash("sha256").update(`qr-enc:${pepper}`).digest();

/**
 * Encrypts a raw QR token for permanent My QR redisplay (AES-256-GCM).
 */
export const encryptQrToken = (token: string, pepper: string): string => {
  const key = deriveEncryptionKey(pepper);
  const iv = randomBytes(QR_ENC_IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
};

/**
 * Decrypts a stored QR token blob for My QR payload construction.
 */
export const decryptQrToken = (blob: string, pepper: string): string => {
  const key = deriveEncryptionKey(pepper);
  const buf = Buffer.from(blob, "base64url");
  const iv = buf.subarray(0, QR_ENC_IV_BYTES);
  const tag = buf.subarray(QR_ENC_IV_BYTES, QR_ENC_IV_BYTES + QR_ENC_TAG_BYTES);
  const data = buf.subarray(QR_ENC_IV_BYTES + QR_ENC_TAG_BYTES);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString(
    "utf8",
  );
};
