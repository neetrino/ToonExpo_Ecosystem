import { ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  AccountType,
  CompanyMemberRole,
  CompanyMemberStatus,
  CompanyType,
  UserStatus,
} from "@toonexpo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthenticatedUser } from "../../auth/types/authenticated-user.js";
import type { PrismaService } from "../../prisma/prisma.service.js";
import { COMPANY_MEMBER_KEY } from "../decorators/company-member.decorator.js";
import { CompanyMemberGuard } from "./company-member.guard.js";

const baseUser = (
  accountType: AuthenticatedUser["accountType"],
): AuthenticatedUser => ({
  id: "user_1",
  name: "Member",
  email: "member@company.example",
  phone: null,
  accountType,
  status: UserStatus.active,
  defaultLocale: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  sessionId: "session_1",
});

describe("CompanyMemberGuard", () => {
  const findUnique = vi.fn();
  let guard: CompanyMemberGuard;
  let reflector: Reflector;

  beforeEach(() => {
    findUnique.mockReset();
    reflector = {
      getAllAndOverride: vi.fn().mockReturnValue({
        required: true,
        builderOnly: true,
      }),
    } as unknown as Reflector;

    const prisma = {
      db: {
        companyMember: { findUnique },
      },
    } as unknown as PrismaService;

    guard = new CompanyMemberGuard(reflector, prisma);
  });

  it("allows an active builder company member", async () => {
    findUnique.mockResolvedValue({
      id: "mem_1",
      companyId: "co_1",
      role: CompanyMemberRole.member,
      status: CompanyMemberStatus.active,
      company: { type: CompanyType.builder },
    });

    const request: { user?: AuthenticatedUser; companyMember?: unknown } = {
      user: baseUser(AccountType.company_member),
    };

    const allowed = await guard.canActivate({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => request }),
    } as never);

    expect(allowed).toBe(true);
    expect(request.companyMember).toEqual({
      companyId: "co_1",
      membershipId: "mem_1",
      role: CompanyMemberRole.member,
    });
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
      COMPANY_MEMBER_KEY,
      expect.any(Array),
    );
  });

  it("rejects non-builder companies when builderOnly", async () => {
    findUnique.mockResolvedValue({
      id: "mem_1",
      companyId: "co_1",
      role: CompanyMemberRole.member,
      status: CompanyMemberStatus.active,
      company: { type: CompanyType.partner },
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
