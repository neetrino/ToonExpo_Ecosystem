'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateGeoMapModelRequest, UpdateGeoMapModelRequest } from '@toonexpo/contracts';

import { listAdminProjects } from '@/features/admin/api/admin-companies-api';
import { ADMIN_PROJECTS_QUERY_KEY } from '@/features/admin/constants';
import {
  createAdminGeoMapModel,
  deleteAdminGeoMapModel,
  listAdminGeoMapModels,
  updateAdminGeoMapModel,
} from '@/features/geo-map/admin/api/geo-map-admin-api';
import {
  ADMIN_GEO_MAP_MODELS_QUERY_KEY,
  GEO_MAP_ADMIN_PROJECTS_PAGE_SIZE,
} from '@/features/geo-map/admin/constants';

/** Loads all geo-map models for the admin editor (draft + published). */
export const useAdminGeoMapModelsQuery = () =>
  useQuery({
    queryKey: ADMIN_GEO_MAP_MODELS_QUERY_KEY,
    queryFn: listAdminGeoMapModels,
  });

/** Loads projects for the create-flow picker (API page-size capped). */
export const useGeoMapAdminProjectsQuery = () =>
  useQuery({
    queryKey: [
      ...ADMIN_PROJECTS_QUERY_KEY,
      { page: 1, pageSize: GEO_MAP_ADMIN_PROJECTS_PAGE_SIZE, purpose: 'geo-map' },
    ],
    queryFn: () =>
      listAdminProjects({
        page: 1,
        pageSize: GEO_MAP_ADMIN_PROJECTS_PAGE_SIZE,
      }),
  });

export const useCreateGeoMapModelMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateGeoMapModelRequest) => createAdminGeoMapModel(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_GEO_MAP_MODELS_QUERY_KEY });
    },
  });
};

export const useUpdateGeoMapModelMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateGeoMapModelRequest }) =>
      updateAdminGeoMapModel(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_GEO_MAP_MODELS_QUERY_KEY });
    },
  });
};

export const useDeleteGeoMapModelMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdminGeoMapModel(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_GEO_MAP_MODELS_QUERY_KEY });
    },
  });
};
