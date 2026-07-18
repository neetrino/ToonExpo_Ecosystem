import type { UserResponse } from "@toonexpo/contracts";
import { describe, expect, it } from "vitest";

import { resolvePostLoginPath } from "@/features/auth/utils/resolve-post-login-path";

const user = (
  accountType: UserResponse["accountType"],
): UserResponse => ({
  id: "user-1",
  email: "staff@example.com",
  name: "Staff",
  phone: null,
  status: "active",
  accountType,
  defaultLocale: "hy",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

describe("resolvePostLoginPath", () => {
  it("returns explicit return URL when provided", () => {
    expect(resolvePostLoginPath(user("buyer"), "/profile/qr")).toBe("/profile/qr");
  });

  it("sends entrance staff to check-in by default", () => {
    expect(resolvePostLoginPath(user("entrance_staff"), null)).toBe("/checkin");
  });
});
