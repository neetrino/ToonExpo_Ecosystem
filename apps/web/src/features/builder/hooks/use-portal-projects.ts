'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreatePortalProjectRequest,
  UpdatePortalProjectRequest,
  UpdatePortalPublicationRequest,
} from '@toonexpo/contracts';

import { ADMIN_PROJECTS_QUERY_KEY } from '@/features/admin/constants';
import {
  createPortalProject,
  deletePortalProject,
  getPortalProject,
  getPortalProjectQr,
  listPortalProjects,
  updatePortalProject,
  updatePortalProjectPublication,
} from '@/features/builder/api/portal-projects-api';
import type { CatalogScope } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import {
  PORTAL_PROJECTS_QUERY_KEY,
  portalProjectQrQueryKey,
  portalProjectQueryKey,
} from '@/features/builder/constants';

const scopeKey = (scope: { mode: string; companyId?: string }) =>
  scope.mode === 'admin' ? ['admin', scope.companyId] : ['portal'];

type PortalProjectQrQueryOptions = {
  enabled?: boolean | undefined;
  scope?: CatalogScope | undefined;
};

/**
 * Paginated portal projects for the builder list and dashboard.
 */
export const usePortalProjectsQuery = (page: number, pageSize: number) => {
  const scope = useCatalogScope();
  return useQuery({
    queryKey: [...PORTAL_PROJECTS_QUERY_KEY, ...scopeKey(scope), { page, pageSize }],
    queryFn: () => listPortalProjects(page, pageSize, { scope }),
  });
};

/**
 * Single portal project detail with inventory tree.
 */
export const usePortalProjectQuery = (id: string) => {
  const scope = useCatalogScope();
  return useQuery({
    queryKey: [...portalProjectQueryKey(id), ...scopeKey(scope)],
    queryFn: () => getPortalProject(id, { scope }),
    enabled: id.length > 0,
  });
};

/**
 * Project QR payload URL for exhibition printouts.
 */
export const usePortalProjectQrQuery = (
  projectId: string,
  options: PortalProjectQrQueryOptions = {},
) => {
  const contextScope = useCatalogScope();
  const scope = options.scope ?? contextScope;
  return useQuery({
    queryKey: [...portalProjectQrQueryKey(projectId), ...scopeKey(scope)],
    queryFn: () => getPortalProjectQr(projectId, { scope }),
    enabled: projectId.length > 0 && (options.enabled ?? true),
  });
};

/**
 * Creates a draft project.
 */
export const useCreatePortalProjectMutation = () => {
  const queryClient = useQueryClient();
  const scope = useCatalogScope();

  return useMutation({
    mutationFn: (body: CreatePortalProjectRequest) => createPortalProject(body, { scope }),
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
  const scope = useCatalogScope();

  return useMutation({
    mutationFn: (body: UpdatePortalProjectRequest) => updatePortalProject(id, body, { scope }),
    onSuccess: (project) => {
      queryClient.setQueryData([...portalProjectQueryKey(id), ...scopeKey(scope)], project);
      void queryClient.invalidateQueries({ queryKey: PORTAL_PROJECTS_QUERY_KEY });
    },
  });
};

/**
 * Changes project publication status.
 */
export const useUpdateProjectPublicationMutation = (id: string) => {
  const queryClient = useQueryClient();
  const scope = useCatalogScope();

  return useMutation({
    mutationFn: (body: UpdatePortalPublicationRequest) =>
      updatePortalProjectPublication(id, body, { scope }),
    onSuccess: (project) => {
      queryClient.setQueryData([...portalProjectQueryKey(id), ...scopeKey(scope)], project);
      void queryClient.invalidateQueries({ queryKey: PORTAL_PROJECTS_QUERY_KEY });
      if (scope.mode === 'admin') {
        void queryClient.invalidateQueries({ queryKey: ADMIN_PROJECTS_QUERY_KEY });
      }
    },
  });
};

/**
 * Deletes a draft project.
 */
export const useDeletePortalProjectMutation = () => {
  const queryClient = useQueryClient();
  const scope = useCatalogScope();

  return useMutation({
    mutationFn: (id: string) => deletePortalProject(id, { scope }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PORTAL_PROJECTS_QUERY_KEY });
    },
  });
};
