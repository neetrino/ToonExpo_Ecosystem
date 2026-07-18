"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateReadinessAssessmentBody,
  CreateReadinessCategoryBody,
  CreateReadinessInternalNoteBody,
  CreateReadinessRecommendationBody,
  CreateReadinessRequiredActionBody,
  UpdateReadinessAssessmentBody,
  UpdateReadinessCategoryBody,
  UpdateReadinessRecommendationBody,
  UpdateReadinessRequiredActionBody,
  UpsertReadinessScoreBody,
} from "@toonexpo/contracts";

import {
  createAdminReadinessAssessment,
  createAdminReadinessCategory,
  createAdminReadinessInternalNote,
  createAdminReadinessRecommendation,
  createAdminReadinessRequiredAction,
  deleteAdminReadinessInternalNote,
  deleteAdminReadinessRecommendation,
  deleteAdminReadinessRequiredAction,
  getAdminReadinessAssessment,
  listAdminReadinessAssessments,
  listAdminReadinessCategories,
  updateAdminReadinessAssessment,
  updateAdminReadinessCategory,
  updateAdminReadinessRecommendation,
  updateAdminReadinessRequiredAction,
  upsertAdminReadinessScore,
  type ListReadinessAssessmentsParams,
} from "@/features/admin/api/admin-readiness-api";
import {
  ADMIN_READINESS_ASSESSMENTS_QUERY_KEY,
  ADMIN_READINESS_CATEGORIES_QUERY_KEY,
  adminReadinessAssessmentQueryKey,
} from "@/features/admin/constants";

export const useAdminReadinessCategoriesQuery = () =>
  useQuery({
    queryKey: ADMIN_READINESS_CATEGORIES_QUERY_KEY,
    queryFn: listAdminReadinessCategories,
  });

export const useCreateReadinessCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateReadinessCategoryBody) =>
      createAdminReadinessCategory(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ADMIN_READINESS_CATEGORIES_QUERY_KEY,
      });
    },
  });
};

export const useUpdateReadinessCategoryMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateReadinessCategoryBody) =>
      updateAdminReadinessCategory(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ADMIN_READINESS_CATEGORIES_QUERY_KEY,
      });
    },
  });
};

export const useAdminReadinessAssessmentsQuery = (
  params: ListReadinessAssessmentsParams,
) =>
  useQuery({
    queryKey: [...ADMIN_READINESS_ASSESSMENTS_QUERY_KEY, params],
    queryFn: () => listAdminReadinessAssessments(params),
  });

export const useAdminReadinessAssessmentQuery = (id: string) =>
  useQuery({
    queryKey: adminReadinessAssessmentQueryKey(id),
    queryFn: () => getAdminReadinessAssessment(id),
    enabled: id.length > 0,
  });

const invalidateAssessmentDetail = (
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
) => {
  void queryClient.invalidateQueries({
    queryKey: adminReadinessAssessmentQueryKey(id),
  });
  void queryClient.invalidateQueries({
    queryKey: ADMIN_READINESS_ASSESSMENTS_QUERY_KEY,
  });
};

export const useCreateReadinessAssessmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateReadinessAssessmentBody) =>
      createAdminReadinessAssessment(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ADMIN_READINESS_ASSESSMENTS_QUERY_KEY,
      });
    },
  });
};

export const useUpdateReadinessAssessmentMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateReadinessAssessmentBody) =>
      updateAdminReadinessAssessment(id, body),
    onSuccess: (assessment) => {
      queryClient.setQueryData(adminReadinessAssessmentQueryKey(id), assessment);
      invalidateAssessmentDetail(queryClient, id);
    },
  });
};

export const useUpsertReadinessScoreMutation = (
  assessmentId: string,
  categoryId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpsertReadinessScoreBody) =>
      upsertAdminReadinessScore(assessmentId, categoryId, body),
    onSuccess: () => {
      invalidateAssessmentDetail(queryClient, assessmentId);
    },
  });
};

export const useCreateReadinessRecommendationMutation = (assessmentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateReadinessRecommendationBody) =>
      createAdminReadinessRecommendation(assessmentId, body),
    onSuccess: () => {
      invalidateAssessmentDetail(queryClient, assessmentId);
    },
  });
};

export const useUpdateReadinessRecommendationMutation = (
  assessmentId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      recId,
      body,
    }: {
      recId: string;
      body: UpdateReadinessRecommendationBody;
    }) => updateAdminReadinessRecommendation(assessmentId, recId, body),
    onSuccess: () => {
      invalidateAssessmentDetail(queryClient, assessmentId);
    },
  });
};

export const useDeleteReadinessRecommendationMutation = (
  assessmentId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recId: string) =>
      deleteAdminReadinessRecommendation(assessmentId, recId),
    onSuccess: () => {
      invalidateAssessmentDetail(queryClient, assessmentId);
    },
  });
};

export const useCreateReadinessRequiredActionMutation = (
  assessmentId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateReadinessRequiredActionBody) =>
      createAdminReadinessRequiredAction(assessmentId, body),
    onSuccess: () => {
      invalidateAssessmentDetail(queryClient, assessmentId);
    },
  });
};

export const useUpdateReadinessRequiredActionMutation = (
  assessmentId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      actionId,
      body,
    }: {
      actionId: string;
      body: UpdateReadinessRequiredActionBody;
    }) => updateAdminReadinessRequiredAction(assessmentId, actionId, body),
    onSuccess: () => {
      invalidateAssessmentDetail(queryClient, assessmentId);
    },
  });
};

export const useDeleteReadinessRequiredActionMutation = (
  assessmentId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (actionId: string) =>
      deleteAdminReadinessRequiredAction(assessmentId, actionId),
    onSuccess: () => {
      invalidateAssessmentDetail(queryClient, assessmentId);
    },
  });
};

export const useCreateReadinessInternalNoteMutation = (assessmentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateReadinessInternalNoteBody) =>
      createAdminReadinessInternalNote(assessmentId, body),
    onSuccess: () => {
      invalidateAssessmentDetail(queryClient, assessmentId);
    },
  });
};

export const useDeleteReadinessInternalNoteMutation = (
  assessmentId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) =>
      deleteAdminReadinessInternalNote(assessmentId, noteId),
    onSuccess: () => {
      invalidateAssessmentDetail(queryClient, assessmentId);
    },
  });
};
