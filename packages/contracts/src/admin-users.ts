import type { AccountType, CompanyMemberRole, CompanyType, UserStatus } from './auth.js';
import type { PaginatedResponse } from './catalog.js';

/**
 * Platform-admin user row for `GET /admin/users`.
 */
export type AdminUserListItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  accountType: AccountType;
  status: UserStatus;
  defaultLocale: string | null;
  companyId: string | null;
  companyName: string | null;
  companyType: CompanyType | null;
  companyMemberRole: CompanyMemberRole | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserListResponse = PaginatedResponse<AdminUserListItem>;
