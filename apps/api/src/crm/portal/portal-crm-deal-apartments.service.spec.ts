import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApartmentSalesStatus,
  CompanyMemberRole,
  CrmDealApartmentLinkType,
  CrmDealStatus,
} from "@toonexpo/db";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { PortalCrmDealApartmentsService } from "./portal-crm-deal-apartments.service.js";

const MEMBER = {
  companyId: "co_1",
  membershipId: "mem_1",
  role: CompanyMemberRole.company_admin,
};

describe("PortalCrmDealApartmentsService", () => {
  const dealFindFirst = vi.fn();
  const apartmentFindFirst = vi.fn();
  const linkCount = vi.fn();
  const linkUpsert = vi.fn();
  const apartmentUpdate = vi.fn();
  const historyCreate = vi.fn();
  const linkUpdateMany = vi.fn();
  const activityCreate = vi.fn();
  const dealUpdate = vi.fn();
  const transaction = vi.fn();

  let service: PortalCrmDealApartmentsService;

  beforeEach(() => {
    vi.clearAllMocks();
    dealFindFirst.mockResolvedValue({
      id: "deal_1",
      status: CrmDealStatus.new_request,
      projectId: null,
    });
    apartmentFindFirst.mockResolvedValue({
      id: "apt_1",
      number: "101",
      projectId: "proj_1",
      salesStatus: ApartmentSalesStatus.available,
      activeCrmDealId: null,
      price: null,
      priceVisibility: "public",
    });
    linkCount.mockResolvedValue(0);
    linkUpsert.mockResolvedValue({
      id: "link_1",
      apartmentId: "apt_1",
      linkType: CrmDealApartmentLinkType.interest,
      isPrimary: true,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      priceAtLink: null,
      apartment: { number: "101", price: null, priceCurrency: "AMD" },
    });
    transaction.mockImplementation(
      async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          crmDealApartmentLink: {
            upsert: linkUpsert,
            updateMany: linkUpdateMany,
          },
          crmFollowUpActivity: { create: activityCreate },
          crmDeal: { update: dealUpdate },
          apartment: { update: apartmentUpdate },
          apartmentStatusHistory: { create: historyCreate },
        }),
    );

    const prisma = {
      db: {
        $transaction: transaction,
        crmDeal: { findFirst: dealFindFirst },
        apartment: { findFirst: apartmentFindFirst },
        crmDealApartmentLink: { count: linkCount },
      },
    } as unknown as PrismaService;

    service = new PortalCrmDealApartmentsService(prisma);
  });

  it("reserves the apartment when it is linked to a deal", async () => {
    const result = await service.attach(MEMBER, "deal_1", "user_1", "apt_1");

    expect(apartmentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "apt_1" },
        data: expect.objectContaining({
          salesStatus: ApartmentSalesStatus.reserved,
          activeCrmDealId: "deal_1",
        }),
      }),
    );
    expect(result.linkType).toBe("reserved");
  });

  it("rejects linking an apartment reserved by another deal", async () => {
    apartmentFindFirst.mockResolvedValue({
      id: "apt_1",
      number: "101",
      projectId: "proj_1",
      salesStatus: ApartmentSalesStatus.reserved,
      activeCrmDealId: "deal_other",
      price: null,
      priceVisibility: "public",
    });

    await expect(service.attach(MEMBER, "deal_1", "user_1", "apt_1")).rejects.toThrow(
      "Apartment is already reserved by another deal",
    );
    expect(transaction).not.toHaveBeenCalled();
  });

  it("rejects a second apartment on the same deal", async () => {
    linkCount.mockResolvedValue(1);

    await expect(service.attach(MEMBER, "deal_1", "user_1", "apt_2")).rejects.toThrow(
      "Deal already has a linked apartment",
    );
    expect(transaction).not.toHaveBeenCalled();
  });
});
