import { ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  AccountType,
  CompanyMemberRole,
  CompanyMemberStatus,
  UserStatus,
} from "@toonexpo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthenticatedUser } from "../auth/types/authenticated-user.js";
import type { PrismaService } from "../prisma/prisma.service.js";
import { COMPANY_ADMIN_KEY } from "../decorators/company-admin.decorator.js";
import { CompanyAdminGuard } from "./company-admin.guard.js";

const baseUser = (accountType: AuthenticatedUser["accountType"]): AuthenticatedUser => ({
  id: "user_1",
  name: "Admin",
  email: "admin@company.example",
  phone: null,
  accountType,
  status: UserStatus.active,
  defaultLocale: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  sessionId: "session_1",
});

describe("CompanyAdminGuard", () => {
  const findUnique = vi.fn();
  let guard: CompanyAdminGuard;
  let reflector: Reflector;

  beforeEach(() => {
    findUnique.mockReset();
    reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(true),
    } as unknown as Reflector;

    const prisma = {
      db: {
        companyMember: { findUnique },
      },
    } as unknown as PrismaService;

    guard = new CompanyAdminGuard(reflector, prisma);
  });

  it("allows an active company_admin", async () => {
    findUnique.mockResolvedValue({
      id: "mem_1",
      companyId: "co_1",
      role: CompanyMemberRole.company_admin,
      status: CompanyMemberStatus.active,
    });

    const request: { user?: AuthenticatedUser; companyAdmin?: unknown } = {
      user: baseUser(AccountType.company_member),
    };

    const allowed = await guard.canActivate({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => request }),
    } as never);

    expect(allowed).toBe(true);
    expect(request.companyAdmin).toEqual({
      companyId: "co_1",
      membershipId: "mem_1",
    });
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
      COMPANY_ADMIN_KEY,
      expect.any(Array),
    );
  });

  it("rejects non-admin members", async () => {
    findUnique.mockResolvedValue({
      id: "mem_1",
      companyId: "co_1",
      role: CompanyMemberRole.member,
      status: CompanyMemberStatus.active,
    });

    await expect(
      guard.canActivate({
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            user: baseUser(AccountType.company_member),
          }),
        }),
      } as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("rejects buyers", async () => {
    await expect(
      guard.canActivate({
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            user: baseUser(AccountType.buyer),
          }),
        }),
      } as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(findUnique).not.toHaveBeenCalled();
  });
});
