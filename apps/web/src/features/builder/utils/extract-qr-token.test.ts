import { describe, expect, it } from "vitest";

import {
  extractQrToken,
  isNonToonexpoQrPayload,
} from "./extract-qr-token";

describe("extractQrToken", () => {
  it("accepts raw tokens", () => {
    expect(extractQrToken("abc_Token-123")).toBe("abc_Token-123");
  });

  it("parses locale and bare QR URLs", () => {
    expect(extractQrToken("https://toonexpo.com/hy/qr/tok_abc")).toBe("tok_abc");
    expect(extractQrToken("http://localhost:3001/ru/qr/tok_xyz/")).toBe(
      "tok_xyz",
    );
    expect(extractQrToken("/qr/tok_path")).toBe("tok_path");
    expect(extractQrToken("/en/qr/tok_en?x=1")).toBe("tok_en");
  });

  it("returns null for unrelated values", () => {
    expect(extractQrToken("")).toBeNull();
    expect(extractQrToken("https://example.com/other")).toBeNull();
    expect(extractQrToken("not a qr")).toBeNull();
  });
});

describe("isNonToonexpoQrPayload", () => {
  it("flags foreign URLs and paths without a ToonExpo QR segment", () => {
    expect(isNonToonexpoQrPayload("https://example.com/x")).toBe(true);
    expect(isNonToonexpoQrPayload("/menu/42")).toBe(true);
  });

  it("does not flag valid ToonExpo QR payloads", () => {
    expect(isNonToonexpoQrPayload("https://toonexpo.com/hy/qr/tok")).toBe(
      false,
    );
    expect(isNonToonexpoQrPayload("tok_only")).toBe(false);
  });
});
