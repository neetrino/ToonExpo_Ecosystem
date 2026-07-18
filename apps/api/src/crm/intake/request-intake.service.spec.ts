import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma, RequestSource } from "@toonexpo/db";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { RequestIntakeService } from "./request-intake.service.js";

describe("RequestIntakeService", () => {
  const transaction = vi.fn();
  const requestCreate = vi.fn();
  const crmDealCreate = vi.fn();
  const crmDealUpdate = vi.fn();
  const crmDealFindFirst = vi.fn();
  const projectFindFirst = vi.fn();
  const activityCreate = vi.fn();
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
    crmDealUpdate.mockResolvedValue({
      id: "deal_1",
      status: "new_request",
      source: RequestSource.manual_builder_entry,
    });
    activityCreate.mockResolvedValue({});

    transaction.mockImplementation(
      async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          crmDeal: {
            create: crmDealCreate,
            update: crmDealUpdate,
            findFirst: crmDealFindFirst,
          },
          request: { create: requestCreate },
          crmFollowUpActivity: { create: activityCreate },
          crmDealApartmentLink: { upsert: vi.fn() },
          apartment: { findUnique: vi.fn() },
        }),
    );

    const prisma = {
      db: {
        $transaction: transaction,
        project: { findFirst: projectFindFirst },
        apartment: { findFirst: vi.fn() },
        buyerProfile: { findUnique: vi.fn() },
        crmDeal: { findFirst: crmDealFindFirst },
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

  it("falls back to attach when create hits open-deal unique violation", async () => {
    crmDealFindFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "deal_existing", status: "contacted" });
    crmDealCreate.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "test",
        meta: { target: ["crm_deals_company_buyer_open_key"] },
      }),
    );
    crmDealUpdate.mockResolvedValue({
      id: "deal_existing",
      status: "contacted",
      source: RequestSource.buyer_project_request,
    });
    requestCreate.mockResolvedValue({ id: "req_attached" });

    const outcome = await service.create({
      builderCompanyId: "co_1",
      buyerProfileId: "bp_1",
      source: RequestSource.buyer_project_request,
      projectId: "proj_1",
    });

    expect(outcome).toEqual({
      requestId: "req_attached",
      dealId: "deal_existing",
      deduplicated: true,
      dealStatus: "contacted",
      source: RequestSource.buyer_project_request,
    });
    expect(crmDealCreate).toHaveBeenCalledOnce();
    expect(requestCreate).toHaveBeenCalled();
    expect(track).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: "req_attached",
        crmDealId: "deal_existing",
      }),
    );
  });
});
