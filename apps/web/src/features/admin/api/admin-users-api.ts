import type { AccountType, AdminUserListResponse, UserStatus } from '@toonexpo/contracts';

import { apiFetch, type ApiFetchOptions } from '@/shared/api/client';

export type ListAdminUsersParams = {
  page: number;
  pageSize: number;
  accountType?: AccountType;
  status?: UserStatus;
  search?: string;
};

export type AdminRequestOptions = {
  cookieHeader?: string | undefined;
};

const withCookie = (options: ApiFetchOptions, cookieHeader?: string): ApiFetchOptions => {
  if (!cookieHeader) {
    return options;
  }
  return {
    ...options,
    headers: {
      ...(options.headers as Record<string, string> | undefined),
      Cookie: cookieHeader,
    },
  };
};

/**
 * Lists platform users for admin (paginated, optional filters).
 */
export const listAdminUsers = (
  params: ListAdminUsersParams,
  options: AdminRequestOptions = {},
): Promise<AdminUserListResponse> => {
  const search = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  if (params.accountType) {
    search.set('accountType', params.accountType);
  }
  if (params.status) {
    search.set('status', params.status);
  }
  if (params.search) {
    search.set('search', params.search);
  }

  return apiFetch<AdminUserListResponse>(
    withCookie(
      {
        path: `/admin/users?${search.toString()}`,
        method: 'GET',
        credentials: 'include',
      },
      options.cookieHeader,
    ),
  );
};
