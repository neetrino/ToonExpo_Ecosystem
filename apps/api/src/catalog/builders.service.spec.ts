import { NotFoundException } from "@nestjs/common";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./utils/load-translations.js", () => ({
  loadTranslations: vi.fn().mockResolvedValue([]),
}));

import { BuildersService } from "./builders.service.js";

describe("BuildersService", () => {
  const companyFindFirst = vi.fn();
  const projectFindMany = vi.fn();
  const analyticsTrack = vi.fn();
  const originalR2PublicUrl = process.env["R2_PUBLIC_URL"];

  const service = new BuildersService(
    {
      db: {
        company: { findMany: vi.fn(), findFirst: companyFindFirst },
        project: { findMany: projectFindMany },
      },
    } as never,
    { track: analyticsTrack } as never,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (originalR2PublicUrl === undefined) {
      delete process.env["R2_PUBLIC_URL"];
    } else {
      process.env["R2_PUBLIC_URL"] = originalR2PublicUrl;
    }
  });

  it("tracks builder_profile_view when loading a builder profile", async () => {
    companyFindFirst.mockResolvedValue({
      id: "builder_1",
      name: "Glendale",
      description: "Builder desc",
      shortDescription: null,
      logoMedia: null,
      coverMedia: null,
      phone: null,
      contactPerson: null,
      email: null,
      websiteUrl: null,
      instagramUrl: null,
      facebookUrl: null,
      region: null,
      address: null,
      mediaMaterialsUrl: null,
      advertisingMaterialsUrl: null,
      _count: { projects: 2 },
    });
    projectFindMany.mockResolvedValue([]);

    const result = await service.getBuilderById("builder_1", {
      locale: "hy",
      isAuthenticated: false,
    });

    expect(result.id).toBe("builder_1");
    expect(analyticsTrack).toHaveBeenCalledWith({
      eventType: "builder_profile_view",
      companyId: "builder_1",
    });
  });

  it("uses the scalar company name when the EN translation is missing", async () => {
    companyFindFirst.mockResolvedValue({
      id: "builder_1",
      name: "Neetrinoo",
      description: null,
      shortDescription: null,
      logoMedia: { fileUrl: "/demo/builder-cascade.webp" },
      coverMedia: { fileUrl: "/demo/building-a.webp" },
      phone: null,
      contactPerson: null,
      email: null,
      websiteUrl: null,
      instagramUrl: null,
      facebookUrl: null,
      region: null,
      address: null,
      mediaMaterialsUrl: null,
      advertisingMaterialsUrl: null,
      _count: { projects: 1 },
    });
    projectFindMany.mockResolvedValue([]);
    process.env["R2_PUBLIC_URL"] = "https://cdn.example.com";

    const result = await service.getBuilderById("builder_1", {
      locale: "en",
      isAuthenticated: false,
    });

    expect(result.name).toBe("Neetrinoo");
    expect(result.logoUrl).toBe("https://cdn.example.com/demo/builder-cascade.webp");
    expect(result.coverUrl).toBe("https://cdn.example.com/demo/building-a.webp");
  });

  it("throws when builder is missing", async () => {
    companyFindFirst.mockResolvedValue(null);

    await expect(
      service.getBuilderById("missing", {
        locale: "hy",
        isAuthenticated: false,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
