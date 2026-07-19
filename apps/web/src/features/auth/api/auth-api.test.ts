import { describe, expect, it, vi } from "vitest";

import { ApiError } from "@/shared/api/errors";

import { getMeOrNull } from "./auth-api";

vi.mock("@/shared/api/client", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "@/shared/api/client";

const mockedApiFetch = vi.mocked(apiFetch);

describe("getMeOrNull", () => {
  it("returns the user when authenticated", async () => {
    const user = {
      id: "user-1",
      name: "Ani",
      email: "ani@example.com",
      phone: "+37491111222",
      accountType: "buyer" as const,
      status: "active" as const,
      defaultLocale: "hy",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    mockedApiFetch.mockResolvedValueOnce(user);

    await expect(getMeOrNull("toonexpo_session=abc")).resolves.toEqual(user);
    expect(mockedApiFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/auth/me",
        headers: { Cookie: "toonexpo_session=abc" },
      }),
    );
  });

  it("returns null on 401", async () => {
    mockedApiFetch.mockRejectedValueOnce(new ApiError(401, "Unauthorized"));

    await expect(getMeOrNull()).resolves.toBeNull();
  });

  it("rethrows non-401 errors", async () => {
    mockedApiFetch.mockRejectedValueOnce(new ApiError(500, "Server Error"));

    await expect(getMeOrNull()).rejects.toMatchObject({ status: 500 });
  });
});
