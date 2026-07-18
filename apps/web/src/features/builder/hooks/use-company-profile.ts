"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getCompanyProfile,
  updateCompanyProfile,
} from "@/features/builder/api/company-profile-api";
import { COMPANY_PROFILE_QUERY_KEY } from "@/features/builder/constants";

/**
 * Authenticated company profile (name, type, status, role).
 */
export const useCompanyProfileQuery = () =>
  useQuery({
    queryKey: COMPANY_PROFILE_QUERY_KEY,
    queryFn: () => getCompanyProfile(),
    staleTime: 60_000,
  });

/**
 * True when the caller's membership role is company_admin.
 */
export const useIsCompanyAdmin = (): boolean => {
  const profile = useCompanyProfileQuery();
  return profile.data?.role === "company_admin";
};

/**
 * Patches company profile fields (company_admin).
 */
export const useUpdateCompanyProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCompanyProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(COMPANY_PROFILE_QUERY_KEY, profile);
    },
  });
};
