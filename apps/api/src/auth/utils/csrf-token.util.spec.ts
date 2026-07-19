import { describe, expect, it } from "vitest";

import { createCsrfToken, verifyCsrfToken } from "./csrf-token.util.js";

const SECRET = "test-csrf-secret-at-least-32-chars!!";
const SESSION_TOKEN = "session-token-raw-value";

describe("csrf-token.util", () => {
  it("creates a deterministic HMAC token for the same inputs", () => {
    const first = createCsrfToken(SESSION_TOKEN, SECRET);
    const second = createCsrfToken(SESSION_TOKEN, SECRET);

    expect(first).toBe(second);
    expect(first.length).toBeGreaterThan(20);
  });

  it("produces different tokens for different session values", () => {
    const a = createCsrfToken(SESSION_TOKEN, SECRET);
    const b = createCsrfToken(`${SESSION_TOKEN}-other`, SECRET);

    expect(a).not.toBe(b);
  });

  it("verifies a matching token and rejects mismatches", () => {
    const token = createCsrfToken(SESSION_TOKEN, SECRET);

    expect(verifyCsrfToken(token, SESSION_TOKEN, SECRET)).toBe(true);
    expect(verifyCsrfToken("wrong-token-value-here!!!!", SESSION_TOKEN, SECRET)).toBe(
      false,
    );
    expect(verifyCsrfToken(token, "other-session", SECRET)).toBe(false);
    expect(verifyCsrfToken("", SESSION_TOKEN, SECRET)).toBe(false);
  });
});
