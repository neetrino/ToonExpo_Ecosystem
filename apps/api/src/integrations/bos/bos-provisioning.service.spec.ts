import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AccountType,
  BosProvisioningStatus,
  CompanySource,
  CompanyStatus,
  CompanyType,
  UserStatus,
} from "@toonexpo/db";

import type { PrismaService } from "../../prisma/prisma.service.js";
import type { CompanyProvisioningService } from "../../company/provisioning/company-provisioning.service.js";
import { BosProvisioningAuditService } from "./bos-provisioning-audit.service.js";
import { BosProvisioningService } from "./bos-provisioning.service.js";
import {
  BOS_CROSS_COMPANY_MESSAGE,
  BOS_EMAIL_CONFLICT_MESSAGE,
  BOS_INVITE_RETRY_MESSAGE,
} from "../integrations.constants.js";

const baseBody = {
  request_id: "req-001",
  bos_company_id: "bos-co-001",
  company_name: "BOS Builder",
  company_type: "builder" as const,
  primary_contact_name: "Primary Admin",
  primary_contact_email: "primary@bos.example",
  requested_modules: ["builder_portal"] as const,
};

describe("BosProvisioningService", () => {
  const bosFindUnique = vi.fn();
  const bosCreate = vi.fn();
  const bosUpdate = vi.fn();
  const companyFindUnique = vi.fn();
  const companyCreate = vi.fn();
  const userFindUnique = vi.fn();
  const userCreate = vi.fn();
  const memberFindUnique = vi.fn();
  const auditCreate = vi.fn();
  const transaction = vi.fn();

  const provisioning = {
    findUserWithMembership: vi.fn(),
    findCompanyByBosId: vi.fn(),
    ensureCompanyAdminMembership: vi.fn(),
    ensureDraftPartnerProfile: vi.fn(),
    sendSetPasswordInvite: vi.fn(),
  };

  let service: BosProvisioningService;

  beforeEach(() => {
    vi.clearAllMocks();

    transaction.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({
        company: {
          findUnique: companyFindUnique,
          create: companyCreate,
        },
        user: {
          findUnique: userFindUnique,
          create: userCreate,
        },
        companyMember: {
          findUnique: memberFindUnique,
        },
      }),
    );

    const prisma = {
      db: {
        bosProvisioningRequest: {
          findUnique: bosFindUnique,
          create: bosCreate,
          update: bosUpdate,
        },
        integrationAuditLog: {
          create: auditCreate,
        },
        $transaction: transaction,
      },
    } as unknown as PrismaService;

    service = new BosProvisioningService(
      prisma,
      provisioning as unknown as CompanyProvisioningService,
      new BosProvisioningAuditService(),
    );
  });

  it("replays terminal success without creating duplicates", async () => {
    const stored = {
      id: "rec-1",
      requestId: baseBody.request_id,
      bosCompanyId: baseBody.bos_company_id,
      companyName: baseBody.company_name,
      companyType: "builder",
      primaryContactName: baseBody.primary_contact_name,
      primaryContactEmail: baseBody.primary_contact_email,
      primaryContactPhone: null,
      eventCycleId: null,
      eventCycleName: null,
      requestedModules: ["builder_portal"],
      status: BosProvisioningStatus.success,
      toonexpoCompanyId: "co-1",
      primaryUserId: "user-1",
      errorMessage: null,
      attemptCount: 1,
      createdAt: new Date("2026-07-18T10:00:00.000Z"),
      updatedAt: new Date("2026-07-18T10:00:00.000Z"),
    };

    bosFindUnique.mockResolvedValue(stored);

    const result = await service.provision(baseBody);

    expect(result).toEqual({
      request_id: baseBody.request_id,
      toonexpo_company_id: "co-1",
      primary_user_id: "user-1",
      status: "success",
      created_at: stored.createdAt.toISOString(),
    });
    expect(bosCreate).not.toHaveBeenCalled();
    expect(companyCreate).not.toHaveBeenCalled();
  });

  it("retries partial state and completes invitation", async () => {
    const partial = {
      id: "rec-partial",
      requestId: baseBody.request_id,
      bosCompanyId: baseBody.bos_company_id,
      companyName: baseBody.company_name,
      companyType: "builder",
      primaryContactName: baseBody.primary_contact_name,
      primaryContactEmail: "primary@bos.example",
      primaryContactPhone: null,
      eventCycleId: null,
      eventCycleName: null,
      requestedModules: ["builder_portal"],
      status: BosProvisioningStatus.partial,
      toonexpoCompanyId: "co-existing",
      primaryUserId: "user-existing",
      errorMessage: BOS_INVITE_RETRY_MESSAGE,
      attemptCount: 1,
      createdAt: new Date("2026-07-18T10:00:00.000Z"),
      updatedAt: new Date("2026-07-18T10:00:00.000Z"),
    };

    bosFindUnique.mockResolvedValue(partial);
    bosUpdate.mockImplementation(({ data }: { data: Record<string, unknown> }) => ({
      ...partial,
      ...data,
      attemptCount: 2,
      status: BosProvisioningStatus.success,
      errorMessage: null,
    }));
    provisioning.findUserWithMembership.mockResolvedValue(null);
    provisioning.findCompanyByBosId.mockResolvedValue(null);
    companyFindUnique.mockResolvedValue({
      id: "co-existing",
      name: baseBody.company_name,
      type: CompanyType.builder,
      status: CompanyStatus.active,
      source: CompanySource.bos,
      bosCompanyId: baseBody.bos_company_id,
    });
    userFindUnique.mockResolvedValue({
      id: "user-existing",
      email: "primary@bos.example",
      name: baseBody.primary_contact_name,
      status: UserStatus.invited,
      passwordHash: null,
      accountType: AccountType.company_member,
    });
    memberFindUnique.mockResolvedValue({
      userId: "user-existing",
      companyId: "co-existing",
    });
    provisioning.ensureCompanyAdminMembership.mockResolvedValue({ created: false });
    provisioning.ensureDraftPartnerProfile.mockResolvedValue({ created: false });
    provisioning.sendSetPasswordInvite.mockResolvedValue(undefined);

    const result = await service.provision(baseBody);

    expect(result.status).toBe("success");
    expect(provisioning.sendSetPasswordInvite).toHaveBeenCalledOnce();
    expect(bosUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: partial.id },
        data: expect.objectContaining({ attemptCount: { increment: 1 } }),
      }),
    );
  });

  it("fails when email is linked to another BOS company", async () => {
    bosFindUnique.mockResolvedValue(null);
    bosCreate.mockResolvedValue({
      id: "rec-new",
      requestId: baseBody.request_id,
      createdAt: new Date("2026-07-18T10:00:00.000Z"),
      status: BosProvisioningStatus.failed,
      toonexpoCompanyId: null,
      primaryUserId: null,
      errorMessage: null,
    });
    bosUpdate.mockImplementation(({ data }: { data: Record<string, unknown> }) => ({
      id: "rec-new",
      requestId: baseBody.request_id,
      createdAt: new Date("2026-07-18T10:00:00.000Z"),
      status: data.status,
      toonexpoCompanyId: null,
      primaryUserId: null,
      errorMessage: data.errorMessage,
    }));
    provisioning.findUserWithMembership.mockResolvedValue({
      id: "user-other",
      companyMembership: {
        companyId: "co-other",
        company: { id: "co-other", bosCompanyId: "bos-other" },
      },
    });

    const result = await service.provision(baseBody);

    expect(result.status).toBe("failed");
    expect(result.error_message).toBe(BOS_EMAIL_CONFLICT_MESSAGE);
    expect(companyCreate).not.toHaveBeenCalled();
  });

  it("fails when contact belongs to another company", async () => {
    bosFindUnique.mockResolvedValue(null);
    bosCreate.mockResolvedValue({
      id: "rec-new",
      requestId: baseBody.request_id,
      createdAt: new Date("2026-07-18T10:00:00.000Z"),
      status: BosProvisioningStatus.failed,
      toonexpoCompanyId: null,
      primaryUserId: null,
      errorMessage: null,
    });
    bosUpdate.mockImplementation(({ data }: { data: Record<string, unknown> }) => ({
      id: "rec-new",
      requestId: baseBody.request_id,
      createdAt: new Date("2026-07-18T10:00:00.000Z"),
      status: data.status,
      toonexpoCompanyId: null,
      primaryUserId: null,
      errorMessage: data.errorMessage,
    }));
    provisioning.findUserWithMembership.mockResolvedValue({
      id: "user-other",
      companyMembership: {
        companyId: "co-other",
        company: { id: "co-other", bosCompanyId: null },
      },
    });
    provisioning.findCompanyByBosId.mockResolvedValue(null);

    const result = await service.provision(baseBody);

    expect(result.status).toBe("failed");
    expect(result.error_message).toBe(BOS_CROSS_COMPANY_MESSAGE);
  });
});
