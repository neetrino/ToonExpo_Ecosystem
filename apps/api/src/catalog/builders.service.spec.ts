import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./utils/load-translations.js", () => ({
  loadTranslations: vi.fn().mockResolvedValue([]),
}));

import { BuildersService } from "./builders.service.js";

describe("BuildersService", () => {
  const companyFindFirst = vi.fn();
  const projectFindMany = vi.fn();
  const analyticsTrack = vi.fn();

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

  it("tracks builder_profile_view when loading a builder profile", async () => {
    companyFindFirst.mockResolvedValue({
      id: "builder_1",
      name: "Glendale",
      description: "Builder desc",
      logoMedia: null,
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
