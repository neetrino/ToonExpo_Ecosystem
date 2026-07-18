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
import { COMPANY_MEMBERS_QUERY_KEY } from "@/features/builder/constants";
import { isApiErrorStatus } from "@/shared/api/errors";

/**
 * Paginated company members (readable by any company member).
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
