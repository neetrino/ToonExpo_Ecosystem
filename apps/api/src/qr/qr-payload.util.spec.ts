import { describe, expect, it } from "vitest";

import {
  buildBuyerQrPayloadUrl,
  buildProjectQrPayloadUrl,
  extractQrToken,
} from "./qr-payload.util.js";

describe("qr-payload", () => {
  it("builds buyer and project payload URLs", () => {
    expect(buildBuyerQrPayloadUrl("http://localhost:3000/", "tok_abc")).toBe(
      "http://localhost:3000/qr/tok_abc",
    );
    expect(
      buildProjectQrPayloadUrl("http://localhost:3000", "hy", "proj_1"),
    ).toBe("http://localhost:3000/hy/projects/proj_1");
  });

  it("extracts token from raw value or URL", () => {
    expect(extractQrToken("tok_abc")).toBe("tok_abc");
    expect(extractQrToken("http://localhost:3000/qr/tok_abc")).toBe("tok_abc");
    expect(extractQrToken("http://localhost:3000/qr/tok_abc?x=1")).toBe(
      "tok_abc",
    );
  });
});
