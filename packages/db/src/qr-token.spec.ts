import { describe, expect, it } from "vitest";

import {
  QR_TOKEN_BYTES,
  createQrToken,
  decryptQrToken,
  encryptQrToken,
  hashQrToken,
} from "./qr-token.js";

const PEPPER = "test-session-token-pepper-32chars-min";

describe("qr-token", () => {
  it("creates opaque tokens with ≥256 bits of entropy", () => {
    const token = createQrToken();
    expect(token.length).toBeGreaterThanOrEqual(43);
    expect(Buffer.from(token, "base64url").byteLength).toBe(QR_TOKEN_BYTES);
  });

  it("hashes tokens deterministically with pepper", () => {
    const token = createQrToken();
    expect(hashQrToken(token, PEPPER)).toBe(hashQrToken(token, PEPPER));
    expect(hashQrToken(token, PEPPER)).not.toBe(
      hashQrToken(token, `${PEPPER}x`),
    );
  });

  it("round-trips encrypted tokens", () => {
    const token = createQrToken();
    const encrypted = encryptQrToken(token, PEPPER);
    expect(encrypted).not.toContain(token);
    expect(decryptQrToken(encrypted, PEPPER)).toBe(token);
  });
});
