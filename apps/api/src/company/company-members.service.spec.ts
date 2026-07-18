import {
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import {
  CompanyMemberRole,
  CompanyMemberStatus,
} from "@toonexpo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { InviteMailerService } from "../access-tokens/invite-mailer.service.js";
import type { PrismaService } from "../prisma/prisma.service.js";
import { CompanyMembersService } from "./company-members.service.js";

describe("CompanyMembersService last-admin protection", () => {
  const findFirst = vi.fn();
  const count = vi.fn();
  const update = vi.fn();
  const userUpdate = vi.fn();
  let service: CompanyMembersService;

  beforeEach(() => {
    findFirst.mockReset();
    count.mockReset();
    update.mockReset();
    userUpdate.mockReset();

    const prisma = {
      db: {
        companyMember: { findFirst, count, update },
        user: { update: userUpdate, findUnique: vi.fn() },
        $transaction: vi.fn(),
      },
    } as unknown as PrismaService;

    service = new CompanyMembersService(
      prisma,
      {} as InviteMailerService,
    );
  });

  it("blocks deactivating the last company_admin", async () => {
    findFirst.mockResolvedValue({
      id: "mem_1",
      companyId: "co_1",
      userId: "user_admin",
      role: CompanyMemberRole.company_admin,
      status: CompanyMemberStatus.active,
      user: { id: "user_admin" },
    });
    count.mockResolvedValue(1);

    await expect(
      service.update(
        { companyId: "co_1", membershipId: "mem_actor" },
        "user_other",
        "mem_1",
        { status: CompanyMemberStatus.inactive },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(update).not.toHaveBeenCalled();
  });

  it("blocks self-deactivation", async () => {
    findFirst.mockResolvedValue({
      id: "mem_1",
      companyId: "co_1",
      userId: "user_self",
      role: CompanyMemberRole.company_admin,
      status: CompanyMemberStatus.active,
      user: { id: "user_self" },
    });

    await expect(
      service.update(
        { companyId: "co_1", membershipId: "mem_1" },
        "user_self",
        "mem_1",
        { status: CompanyMemberStatus.removed },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(count).not.toHaveBeenCalled();
  });
});
