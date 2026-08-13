import type {
  CreateReadinessAssessmentBody,
  CreateReadinessInternalNoteBody,
  CreateReadinessRecommendationBody,
  CreateReadinessRequiredActionBody,
  EnsureBuilderReadinessAssessmentsResponse,
  ReadinessAssessmentDetail,
  ReadinessAssessmentListResponse,
  ReadinessAssessmentTargetType,
  ReadinessInternalNoteItem,
  ReadinessRecommendationItem,
  ReadinessRequiredActionItem,
  ReadinessScoreItem,
  ReadinessScoreStatus,
  ReadinessCriterionItem,
  UpdateReadinessAssessmentBody,
  UpdateReadinessCriterionBody,
  UpdateReadinessRecommendationBody,
  UpdateReadinessRequiredActionBody,
  UpsertReadinessScoreBody,
  UpsertReadinessCriterionScoreBody,
  UpsertReadinessCriterionScoresBatchBody,
} from '@toonexpo/contracts';

import { apiFetch } from '@/shared/api/client';

const jsonCredentials = {
  credentials: 'include' as const,
  headers: { 'Content-Type': 'application/json' },
};

export type ListReadinessAssessmentsParams = {
  page: number;
  pageSize: number;
  builderCompanyId?: string;
  projectId?: string;
  targetType?: ReadinessAssessmentTargetType;
  status?: ReadinessScoreStatus;
};

export const listAdminReadinessAssessments = (
  params: ListReadinessAssessmentsParams,
): Promise<ReadinessAssessmentListResponse> => {
  const search = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  if (params.builderCompanyId) {
    search.set('builderCompanyId', params.builderCompanyId);
  }
  if (params.projectId) {
    search.set('projectId', params.projectId);
  }
  if (params.targetType) {
    search.set('targetType', params.targetType);
  }
  if (params.status) {
    search.set('status', params.status);
  }

  return apiFetch<ReadinessAssessmentListResponse>({
    path: `/admin/readiness/assessments?${search.toString()}`,
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });
};

export const getAdminReadinessAssessment = (id: string): Promise<ReadinessAssessmentDetail> =>
  apiFetch<ReadinessAssessmentDetail>({
    path: `/admin/readiness/assessments/${encodeURIComponent(id)}`,
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

export const createAdminReadinessAssessment = (
  body: CreateReadinessAssessmentBody,
): Promise<ReadinessAssessmentDetail> =>
  apiFetch<ReadinessAssessmentDetail>({
    path: '/admin/readiness/assessments',
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

/**
 * Creates missing company-level assessments so Admin Builders appear in Readiness.
 */
export const ensureAdminBuilderReadinessAssessments =
  (): Promise<EnsureBuilderReadinessAssessmentsResponse> =>
    apiFetch<EnsureBuilderReadinessAssessmentsResponse>({
      path: '/admin/readiness/assessments/ensure-builders',
      method: 'POST',
      ...jsonCredentials,
    });

export const updateAdminReadinessAssessment = (
  id: string,
  body: UpdateReadinessAssessmentBody,
): Promise<ReadinessAssessmentDetail> =>
  apiFetch<ReadinessAssessmentDetail>({
    path: `/admin/readiness/assessments/${encodeURIComponent(id)}`,
    method: 'PATCH',
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
    method: 'PUT',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const upsertAdminReadinessCriterionScore = (
  assessmentId: string,
  criterionId: string,
  body: UpsertReadinessCriterionScoreBody,
): Promise<ReadinessAssessmentDetail> =>
  apiFetch<ReadinessAssessmentDetail>({
    path: `/admin/readiness/assessments/${encodeURIComponent(assessmentId)}/criteria/${encodeURIComponent(criterionId)}`,
    method: 'PUT',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const updateAdminReadinessCriterion = (
  criterionId: string,
  body: UpdateReadinessCriterionBody,
): Promise<ReadinessCriterionItem> =>
  apiFetch<ReadinessCriterionItem>({
    path: `/admin/readiness/criteria/${encodeURIComponent(criterionId)}`,
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const upsertAdminReadinessCriterionScoresBatch = (
  assessmentId: string,
  body: UpsertReadinessCriterionScoresBatchBody,
): Promise<ReadinessAssessmentDetail> =>
  apiFetch<ReadinessAssessmentDetail>({
    path: `/admin/readiness/assessments/${encodeURIComponent(assessmentId)}/criteria`,
    method: 'PUT',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const createAdminReadinessRecommendation = (
  assessmentId: string,
  body: CreateReadinessRecommendationBody,
): Promise<ReadinessRecommendationItem> =>
  apiFetch<ReadinessRecommendationItem>({
    path: `/admin/readiness/assessments/${encodeURIComponent(assessmentId)}/recommendations`,
    method: 'POST',
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
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const deleteAdminReadinessRecommendation = (
  assessmentId: string,
  recId: string,
): Promise<void> =>
  apiFetch<void>({
    path: `/admin/readiness/assessments/${encodeURIComponent(assessmentId)}/recommendations/${encodeURIComponent(recId)}`,
    method: 'DELETE',
    credentials: 'include',
  });

export const createAdminReadinessRequiredAction = (
  assessmentId: string,
  body: CreateReadinessRequiredActionBody,
): Promise<ReadinessRequiredActionItem> =>
  apiFetch<ReadinessRequiredActionItem>({
    path: `/admin/readiness/assessments/${encodeURIComponent(assessmentId)}/required-actions`,
    method: 'POST',
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
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const deleteAdminReadinessRequiredAction = (
  assessmentId: string,
  actionId: string,
): Promise<void> =>
  apiFetch<void>({
    path: `/admin/readiness/assessments/${encodeURIComponent(assessmentId)}/required-actions/${encodeURIComponent(actionId)}`,
    method: 'DELETE',
    credentials: 'include',
  });

export const createAdminReadinessInternalNote = (
  assessmentId: string,
  body: CreateReadinessInternalNoteBody,
): Promise<ReadinessInternalNoteItem> =>
  apiFetch<ReadinessInternalNoteItem>({
    path: `/admin/readiness/assessments/${encodeURIComponent(assessmentId)}/internal-notes`,
    method: 'POST',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export const deleteAdminReadinessInternalNote = (
  assessmentId: string,
  noteId: string,
): Promise<void> =>
  apiFetch<void>({
    path: `/admin/readiness/assessments/${encodeURIComponent(assessmentId)}/internal-notes/${encodeURIComponent(noteId)}`,
    method: 'DELETE',
    credentials: 'include',
  });
