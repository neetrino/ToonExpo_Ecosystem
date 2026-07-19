import type {
  CompanyMemberResponse,
  CompanyMemberRole,
  CompanyMemberStatus,
  UserResponse,
} from "@toonexpo/contracts";

import { toUserResponse } from "../../auth/mappers/user.mapper.js";

type MemberRecord = {
  id: string;
  companyId: string;
  role: CompanyMemberRole;
  status: CompanyMemberStatus;
  invitedByUserId: string | null;
  joinedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    accountType: UserResponse["accountType"];
    status: UserResponse["status"];
    defaultLocale: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

/**
 * Maps a company membership (with user) to the public API contract.
 */
export const toCompanyMemberResponse = (
  member: MemberRecord,
): CompanyMemberResponse => ({
  id: member.id,
  companyId: member.companyId,
  role: member.role,
  status: member.status,
  invitedByUserId: member.invitedByUserId,
  joinedAt: member.joinedAt?.toISOString() ?? null,
  createdAt: member.createdAt.toISOString(),
  updatedAt: member.updatedAt.toISOString(),
  user: toUserResponse(member.user),
});
