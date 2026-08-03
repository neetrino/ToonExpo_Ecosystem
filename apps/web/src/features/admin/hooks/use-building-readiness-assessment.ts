'use client';

import type { AdminBuildingListItem } from '@toonexpo/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import {
  createAdminReadinessAssessment,
  getAdminReadinessAssessment,
  listAdminReadinessAssessments,
} from '@/features/admin/api/admin-readiness-api';
import {
  ADMIN_READINESS_ASSESSMENTS_QUERY_KEY,
  adminReadinessAssessmentQueryKey,
} from '@/features/admin/constants';

type UseBuildingReadinessAssessmentArgs = {
  building: AdminBuildingListItem | null;
  enabled: boolean;
};

/**
 * Resolves (or creates) the active project readiness assessment for a building.
 */
export const useBuildingReadinessAssessment = ({
  building,
  enabled,
}: UseBuildingReadinessAssessmentArgs) => {
  const queryClient = useQueryClient();
  const ensuringRef = useRef(false);
  const buildingKey = building ? `${building.builderCompanyId}:${building.projectId}` : '';

  const listQuery = useQuery({
    queryKey: [...ADMIN_READINESS_ASSESSMENTS_QUERY_KEY, 'by-project', buildingKey],
    queryFn: () =>
      listAdminReadinessAssessments({
        page: 1,
        pageSize: 20,
        builderCompanyId: building!.builderCompanyId,
        projectId: building!.projectId,
        targetType: 'project',
      }),
    enabled: enabled && building != null,
  });

  const activeListItem = listQuery.data?.data.find((item) => item.archivedAt === null) ?? null;

  const createMutation = useMutation({
    mutationFn: () =>
      createAdminReadinessAssessment({
        targetType: 'project',
        builderCompanyId: building!.builderCompanyId,
        projectId: building!.projectId,
      }),
    onSuccess: (assessment) => {
      queryClient.setQueryData(adminReadinessAssessmentQueryKey(assessment.id), assessment);
      void queryClient.invalidateQueries({
        queryKey: ADMIN_READINESS_ASSESSMENTS_QUERY_KEY,
      });
    },
  });

  const {
    mutateAsync,
    reset,
    isPending,
    data: createdAssessment,
    isError: createError,
  } = createMutation;

  useEffect(() => {
    ensuringRef.current = false;
    reset();
  }, [buildingKey, reset]);

  useEffect(() => {
    if (!enabled || !building || !listQuery.isSuccess || ensuringRef.current) {
      return;
    }
    if (activeListItem || isPending) {
      return;
    }
    ensuringRef.current = true;
    void mutateAsync().finally(() => {
      ensuringRef.current = false;
    });
  }, [activeListItem, building, enabled, isPending, listQuery.isSuccess, mutateAsync]);

  const assessmentId = activeListItem?.id ?? createdAssessment?.id ?? '';

  const detailQuery = useQuery({
    queryKey: adminReadinessAssessmentQueryKey(assessmentId),
    queryFn: () => getAdminReadinessAssessment(assessmentId),
    enabled: assessmentId.length > 0,
  });

  return {
    assessment: detailQuery.data ?? createdAssessment ?? null,
    isLoading:
      listQuery.isLoading || isPending || (assessmentId.length > 0 && detailQuery.isLoading),
    isError: listQuery.isError || createError || detailQuery.isError,
  };
};
