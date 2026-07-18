import { beforeEach, describe, expect, it, vi } from "vitest";
import { RequestSource } from "@toonexpo/db";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { RequestIntakeService } from "./request-intake.service.js";

describe("RequestIntakeService analytics", () => {
  const transaction = vi.fn();
  const requestCreate = vi.fn();
  const crmDealCreate = vi.fn();
  const crmDealUpdate = vi.fn();
  const projectFindFirst = vi.fn();
  const track = vi.fn();

  let service: RequestIntakeService;

  beforeEach(() => {
    vi.clearAllMocks();
    projectFindFirst.mockResolvedValue({ id: "proj_1" });
    crmDealCreate.mockResolvedValue({
      id: "deal_1",
      status: "new_request",
      source: RequestSource.manual_builder_entry,
    });
    requestCreate.mockResolvedValue({ id: "req_1" });
    crmDealUpdate.mockResolvedValue({});

    transaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) =>
      callback({
        crmDeal: {
          create: crmDealCreate,
          update: crmDealUpdate,
        },
        request: { create: requestCreate },
        crmDealApartmentLink: { upsert: vi.fn() },
      }),
    );

    const prisma = {
      db: {
        $transaction: transaction,
        project: { findFirst: projectFindFirst },
        apartment: { findFirst: vi.fn() },
        buyerProfile: { findUnique: vi.fn() },
        crmDeal: { findFirst: vi.fn() },
      },
    } as unknown as PrismaService;

    service = new RequestIntakeService(prisma, { track } as never);
  });

  it("tracks request_created with ids only, not manual contact fields", async () => {
    await service.create({
      builderCompanyId: "co_1",
      source: RequestSource.manual_builder_entry,
      contactName: "Jane Buyer",
      contactEmail: "jane@example.com",
      contactPhone: "+37400000000",
      projectId: "proj_1",
    });

    expect(track).toHaveBeenCalledWith({
      eventType: "request_created",
      source: RequestSource.manual_builder_entry,
      requestId: "req_1",
      crmDealId: "deal_1",
      projectId: "proj_1",
      companyId: "co_1",
      actorUserId: null,
    });

    const serialized = JSON.stringify(track.mock.calls[0]?.[0]);
    expect(serialized).not.toContain("jane@example.com");
    expect(serialized).not.toContain("Jane Buyer");
    expect(serialized).not.toContain("+37400000000");
  });
});
