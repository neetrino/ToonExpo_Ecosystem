"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  InviteCompanyMemberRequest,
  UpdateCompanyMemberRequest,
} from "@toonexpo/contracts";

import {
  inviteCompanyMember,
  listCompanyMembers,
  updateCompanyMember,
} from "@/features/builder/api/company-members-api";
import {
  COMPANY_ADMIN_PROBE_QUERY_KEY,
  COMPANY_MEMBERS_QUERY_KEY,
} from "@/features/builder/constants";
import { isApiErrorStatus } from "@/shared/api/errors";

/**
 * Probes whether the current user is a company_admin (members API access).
 */
export const useIsCompanyAdminQuery = () =>
  useQuery({
    queryKey: COMPANY_ADMIN_PROBE_QUERY_KEY,
    queryFn: async (): Promise<boolean> => {
      try {
        await listCompanyMembers(1, 1);
        return true;
      } catch (error) {
        if (isApiErrorStatus(error, 403)) {
          return false;
        }
        throw error;
      }
    },
    staleTime: 60_000,
  });

/**
 * Paginated company members (company_admin only).
 */
export const useCompanyMembersQuery = (
  page: number,
  pageSize: number,
  enabled = true,
) =>
  useQuery({
    queryKey: [...COMPANY_MEMBERS_QUERY_KEY, { page, pageSize }],
    queryFn: () => listCompanyMembers(page, pageSize),
    enabled,
    retry: (failureCount, error) => {
      if (isApiErrorStatus(error, 403)) {
        return false;
      }
      return failureCount < 2;
    },
  });

/**
 * Invites a company member.
 */
export const useInviteMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: InviteCompanyMemberRequest) => inviteCompanyMember(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: COMPANY_MEMBERS_QUERY_KEY });
    },
  });
};

/**
 * Updates member role or status.
 */
export const useUpdateMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateCompanyMemberRequest;
    }) => updateCompanyMember(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: COMPANY_MEMBERS_QUERY_KEY });
    },
  });
};
