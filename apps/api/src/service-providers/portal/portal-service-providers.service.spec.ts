import { beforeEach, describe, expect, it, vi } from "vitest";
import { ServiceProviderType } from "@toonexpo/db";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { PortalServiceProvidersService } from "./portal-service-providers.service.js";

describe("PortalServiceProvidersService", () => {
  const serviceProviderFindMany = vi.fn();
  let service: PortalServiceProvidersService;

  beforeEach(() => {
    vi.clearAllMocks();

    const prisma = {
      db: {
        serviceProvider: { findMany: serviceProviderFindMany },
      },
    } as unknown as PrismaService;

    service = new PortalServiceProvidersService(prisma);
  });

  it("never exposes internalNotes in portal provider response", async () => {
    serviceProviderFindMany.mockResolvedValue([
      {
        id: "provider_1",
        name: "Legal Help LLC",
        providerType: ServiceProviderType.company,
        description: "Public description",
        services: "Legal docs",
        phone: "+37400000000",
        email: "help@example.com",
        website: "https://example.com",
        socialLinks: { linkedin: "https://linkedin.com/company/example" },
        internalNotes: "Do not share with builders",
        categories: [],
      },
    ]);

    const result = await service.listByCategory({ categoryId: "cat_legal" });

    expect(result.data).toHaveLength(1);
    expect(JSON.stringify(result)).not.toContain("internalNotes");
    expect(JSON.stringify(result)).not.toContain("Do not share with builders");
  });
});
