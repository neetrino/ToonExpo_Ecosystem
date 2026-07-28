'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateDistrictRequest,
  SetupBuildingFloorsRequest,
  UpdateDistrictRequest,
} from '@toonexpo/contracts';

import {
  createInteractiveMappingDistrict,
  deleteInteractiveMappingDistrict,
  getInteractiveMappingProject,
  listInteractiveMappingProjects,
  setupBuildingFloors,
  updateInteractiveMappingDistrict,
} from '../api/interactive-mapping-api';
import {
  INTERACTIVE_MAPPING_PROJECTS_QUERY_KEY,
  interactiveMappingProjectQueryKey,
} from '../constants';

export const useInteractiveMappingProjectsQuery = () =>
  useQuery({
    queryKey: INTERACTIVE_MAPPING_PROJECTS_QUERY_KEY,
    queryFn: () => listInteractiveMappingProjects(),
  });

export const useInteractiveMappingProjectQuery = (projectId: string) =>
  useQuery({
    queryKey: interactiveMappingProjectQueryKey(projectId),
    queryFn: () => getInteractiveMappingProject(projectId),
    enabled: projectId.length > 0,
  });

export const useCreateDistrictMutation = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateDistrictRequest) => createInteractiveMappingDistrict(projectId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: interactiveMappingProjectQueryKey(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: INTERACTIVE_MAPPING_PROJECTS_QUERY_KEY,
      });
    },
  });
};

export const useUpdateDistrictMutation = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { districtId: string; body: UpdateDistrictRequest }) =>
      updateInteractiveMappingDistrict(input.districtId, input.body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: interactiveMappingProjectQueryKey(projectId),
      });
    },
  });
};

export const useDeleteDistrictMutation = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (districtId: string) => deleteInteractiveMappingDistrict(districtId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: interactiveMappingProjectQueryKey(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: INTERACTIVE_MAPPING_PROJECTS_QUERY_KEY,
      });
    },
  });
};

export const useSetupBuildingFloorsMutation = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { buildingId: string; body: SetupBuildingFloorsRequest }) =>
      setupBuildingFloors(input.buildingId, input.body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: interactiveMappingProjectQueryKey(projectId),
      });
    },
  });
};
