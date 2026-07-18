import type {
  CreateReadinessAssessmentBody,
  CreateReadinessCategoryBody,
  CreateReadinessInternalNoteBody,
  CreateReadinessRecommendationBody,
  CreateReadinessRequiredActionBody,
  ReadinessAssessmentDetail,
  ReadinessAssessmentListResponse,
  ReadinessAssessmentTargetType,
  ReadinessCategoryItem,
  ReadinessCategoryListResponse,
  ReadinessInternalNoteItem,
  ReadinessRecommendationItem,
  ReadinessRequiredActionItem,
  ReadinessScoreItem,
  ReadinessScoreStatus,
  UpdateReadinessAssessmentBody,
  UpdateReadinessCategoryBody,
  UpdateReadinessRecommendationBody,
  UpdateReadinessRequiredActionBody,
  UpsertReadinessScoreBody,
} from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";

const jsonCredentials = {
  credentials: "include" as const,
  headers: { "Content-Type": "application/json" },
};

export type ListReadinessAssessmentsParams = {
  page: number;
  pageSize: number;
  builderCompanyId?: string;
  targetType?: ReadinessAssessmentTargetType;
  status?: ReadinessScoreStatus;
};

export const listAdminReadinessCategories =
  (): Promise<ReadinessCategoryListResponse> =>
    apiFetch<ReadinessCategoryListResponse>({
      path: "/admin/readiness/categories",
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

export const createAdminReadinessCategory = (
  body: CreateReadinessCategoryBody,
): Promise<ReadinessCategoryItem> =>
  apiFetch<ReadinessCategoryItem>({
    path: "/admin/readiness/categories",
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const updateAdminReadinessCategory = (
  id: string,
  body: UpdateReadinessCategoryBody,
): Promise<ReadinessCategoryItem> =>
  apiFetch<ReadinessCategoryItem>({
    path: `/admin/readiness/categories/${encodeURIComponent(id)}`,
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const listAdminReadinessAssessments = (
  params: ListReadinessAssessmentsParams,
): Promise<ReadinessAssessmentListResponse> => {
  const search = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  if (params.builderCompanyId) {
    search.set("builderCompanyId", params.builderCompanyId);
  }
  if (params.targetType) {
    search.set("targetType", params.targetType);
  }
  if (params.status) {
    search.set("status", params.status);
  }

  return apiFetch<ReadinessAssessmentListResponse>({
    path: `/admin/readiness/assessments?${search.toString()}`,
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
};

export const getAdminReadinessAssessment = (
  id: string,
): Promise<ReadinessAssessmentDetail> =>
  apiFetch<ReadinessAssessmentDetail>({
    path: `/admin/readiness/assessments/${encodeURIComponent(id)}`,
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

export const createAdminReadinessAssessment = (
  body: CreateReadinessAssessmentBody,
): Promise<ReadinessAssessmentDetail> =>
  apiFetch<ReadinessAssessmentDetail>({
    path: "/admin/readiness/assessments",
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const updateAdminReadinessAssessment = (
  id: string,
  body: UpdateReadinessAssessmentBody,
): Promise<ReadinessAssessmentDetail> =>
  apiFetch<ReadinessAssessmentDetail>({
    path: `/admin/readiness/assessments/${encodeURIComponent(id)}`,
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const upsertAdminReadinessScore = (
  assessmentId: string,
  categoryId: string,
  body: UpsertReadinessScoreBody,
): Promise<ReadinessScoreItem> =>
  apiFetch<ReadinessScoreItem>({
    path: `/admin/readiness/assessments/${encodeURIComponent(assessmentId)}/scores/${encodeURIComponent(categoryId)}`,
    method: "PUT",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const createAdminReadinessRecommendation = (
  assessmentId: string,
  body: CreateReadinessRecommendationBody,
): Promise<ReadinessRecommendationItem> =>
  apiFetch<ReadinessRecommendationItem>({
    path: `/admin/readiness/assessments/${encodeURIComponent(assessmentId)}/recommendations`,
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const updateAdminReadinessRecommendation = (
  assessmentId: string,
  recId: string,
  body: UpdateReadinessRecommendationBody,
): Promise<ReadinessRecommendationItem> =>
  apiFetch<ReadinessRecommendationItem>({
    path: `/admin/readiness/assessments/${encodeURIComponent(assessmentId)}/recommendations/${encodeURIComponent(recId)}`,
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const deleteAdminReadinessRecommendation = (
  assessmentId: string,
  recId: string,
): Promise<void> =>
  apiFetch<void>({
    path: `/admin/readiness/assessments/${encodeURIComponent(assessmentId)}/recommendations/${encodeURIComponent(recId)}`,
    method: "DELETE",
    credentials: "include",
  });

export const createAdminReadinessRequiredAction = (
  assessmentId: string,
  body: CreateReadinessRequiredActionBody,
): Promise<ReadinessRequiredActionItem> =>
  apiFetch<ReadinessRequiredActionItem>({
    path: `/admin/readiness/assessments/${encodeURIComponent(assessmentId)}/required-actions`,
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const updateAdminReadinessRequiredAction = (
  assessmentId: string,
  actionId: string,
  body: UpdateReadinessRequiredActionBody,
): Promise<ReadinessRequiredActionItem> =>
  apiFetch<ReadinessRequiredActionItem>({
    path: `/admin/readiness/assessments/${encodeURIComponent(assessmentId)}/required-actions/${encodeURIComponent(actionId)}`,
    method: "PATCH",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const deleteAdminReadinessRequiredAction = (
  assessmentId: string,
  actionId: string,
): Promise<void> =>
  apiFetch<void>({
    path: `/admin/readiness/assessments/${encodeURIComponent(assessmentId)}/required-actions/${encodeURIComponent(actionId)}`,
    method: "DELETE",
    credentials: "include",
  });

export const createAdminReadinessInternalNote = (
  assessmentId: string,
  body: CreateReadinessInternalNoteBody,
): Promise<ReadinessInternalNoteItem> =>
  apiFetch<ReadinessInternalNoteItem>({
    path: `/admin/readiness/assessments/${encodeURIComponent(assessmentId)}/internal-notes`,
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const deleteAdminReadinessInternalNote = (
  assessmentId: string,
  noteId: string,
): Promise<void> =>
  apiFetch<void>({
    path: `/admin/readiness/assessments/${encodeURIComponent(assessmentId)}/internal-notes/${encodeURIComponent(noteId)}`,
    method: "DELETE",
    credentials: "include",
  });
