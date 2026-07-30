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
  interactiveMappingProjectQueryKey,
  interactiveMappingProjectsQueryKey,
} from '../constants';
import { useInteractiveMappingScope } from '../scope/interactive-mapping-scope';

export const useInteractiveMappingProjectsQuery = () => {
  const { mode } = useInteractiveMappingScope();
  return useQuery({
    queryKey: interactiveMappingProjectsQueryKey(mode),
    queryFn: () => listInteractiveMappingProjects({ mode }),
  });
};

export const useInteractiveMappingProjectQuery = (projectId: string) => {
  const { mode } = useInteractiveMappingScope();
  return useQuery({
    queryKey: interactiveMappingProjectQueryKey(projectId, mode),
    queryFn: () => getInteractiveMappingProject(projectId, { mode }),
    enabled: projectId.length > 0,
  });
};

export const useCreateDistrictMutation = (projectId: string) => {
  const { mode } = useInteractiveMappingScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateDistrictRequest) =>
      createInteractiveMappingDistrict(projectId, body, mode),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: interactiveMappingProjectQueryKey(projectId, mode),
      });
      void queryClient.invalidateQueries({
        queryKey: interactiveMappingProjectsQueryKey(mode),
      });
    },
  });
};

export const useUpdateDistrictMutation = (projectId: string) => {
  const { mode } = useInteractiveMappingScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { districtId: string; body: UpdateDistrictRequest }) =>
      updateInteractiveMappingDistrict(input.districtId, input.body, mode),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: interactiveMappingProjectQueryKey(projectId, mode),
      });
    },
  });
};

export const useDeleteDistrictMutation = (projectId: string) => {
  const { mode } = useInteractiveMappingScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (districtId: string) => deleteInteractiveMappingDistrict(districtId, mode),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: interactiveMappingProjectQueryKey(projectId, mode),
      });
      void queryClient.invalidateQueries({
        queryKey: interactiveMappingProjectsQueryKey(mode),
      });
    },
  });
};

export const useSetupBuildingFloorsMutation = (projectId: string) => {
  const { mode } = useInteractiveMappingScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { buildingId: string; body: SetupBuildingFloorsRequest }) =>
      setupBuildingFloors(input.buildingId, input.body, mode),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: interactiveMappingProjectQueryKey(projectId, mode),
      });
    },
  });
};
