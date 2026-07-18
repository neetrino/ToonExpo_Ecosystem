"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreatePortalProjectRequest,
  UpdatePortalProjectRequest,
  UpdatePortalPublicationRequest,
} from "@toonexpo/contracts";

import {
  createPortalProject,
  deletePortalProject,
  getPortalProject,
  getPortalProjectQr,
  listPortalProjects,
  updatePortalProject,
  updatePortalProjectPublication,
} from "@/features/builder/api/portal-projects-api";
import {
  PORTAL_PROJECTS_QUERY_KEY,
  portalProjectQrQueryKey,
  portalProjectQueryKey,
} from "@/features/builder/constants";

/**
 * Paginated portal projects for the builder list and dashboard.
 */
export const usePortalProjectsQuery = (page: number, pageSize: number) =>
  useQuery({
    queryKey: [...PORTAL_PROJECTS_QUERY_KEY, { page, pageSize }],
    queryFn: () => listPortalProjects(page, pageSize),
  });

/**
 * Single portal project detail with inventory tree.
 */
export const usePortalProjectQuery = (id: string) =>
  useQuery({
    queryKey: portalProjectQueryKey(id),
    queryFn: () => getPortalProject(id),
    enabled: id.length > 0,
  });

/**
 * Project QR payload URL for exhibition printouts.
 */
export const usePortalProjectQrQuery = (projectId: string) =>
  useQuery({
    queryKey: portalProjectQrQueryKey(projectId),
    queryFn: () => getPortalProjectQr(projectId),
    enabled: projectId.length > 0,
  });

/**
 * Creates a draft project.
 */
export const useCreatePortalProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreatePortalProjectRequest) => createPortalProject(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PORTAL_PROJECTS_QUERY_KEY });
    },
  });
};

/**
 * Patches project fields.
 */
export const useUpdatePortalProjectMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdatePortalProjectRequest) =>
      updatePortalProject(id, body),
    onSuccess: (project) => {
      queryClient.setQueryData(portalProjectQueryKey(id), project);
      void queryClient.invalidateQueries({ queryKey: PORTAL_PROJECTS_QUERY_KEY });
    },
  });
};

/**
 * Changes project publication status.
 */
export const useUpdateProjectPublicationMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdatePortalPublicationRequest) =>
      updatePortalProjectPublication(id, body),
    onSuccess: (project) => {
      queryClient.setQueryData(portalProjectQueryKey(id), project);
      void queryClient.invalidateQueries({ queryKey: PORTAL_PROJECTS_QUERY_KEY });
    },
  });
};

/**
 * Deletes a draft project.
 */
export const useDeletePortalProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePortalProject(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PORTAL_PROJECTS_QUERY_KEY });
    },
  });
};
