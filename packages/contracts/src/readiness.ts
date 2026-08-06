/**
 * Builder Readiness contracts (admin evaluation + builder portal view).
 */

import type { PaginatedResponse } from './catalog.js';

export type ReadinessAssessmentTargetType = 'builder_company' | 'project';

export type ReadinessScoreStatus =
  'not_started' | 'needs_improvement' | 'in_progress' | 'ready' | 'blocked';

export type ReadinessVisibility = 'builder_visible' | 'internal_only';

export type ReadinessRequiredActionStatus =
  'open' | 'in_progress' | 'done' | 'blocked' | 'cancelled';

export type ReadinessCategoryItem = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  weight: number | null;
  sortOrder: number;
  serviceProviderCategoryId: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ReadinessCategoryListResponse = {
  data: ReadinessCategoryItem[];
};

export type CreateReadinessCategoryBody = {
  code: string;
  name: string;
  description?: string;
  weight?: number;
  sortOrder?: number;
  serviceProviderCategoryId?: string;
  active?: boolean;
};

export type UpdateReadinessCategoryBody = {
  code?: string;
  name?: string;
  description?: string | null;
  weight?: number | null;
  sortOrder?: number;
  serviceProviderCategoryId?: string | null;
  active?: boolean;
};

export type ReadinessCriterionScoreItem = {
  scoreId: string | null;
  criterionId: string;
  code: string;
  parentId: string | null;
  maxPoints: number | null;
  sortOrder: number;
  value: number | null;
  checked: boolean;
  children: ReadinessCriterionScoreItem[];
};

export type ReadinessScoreItem = {
  id: string;
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  categoryWeight: number | null;
  score: number | null;
  status: ReadinessScoreStatus;
  recommendationSummary: string | null;
  evaluatedByUserId: string | null;
  evaluatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  criteria: ReadinessCriterionScoreItem[];
};

export type ReadinessRecommendationItem = {
  id: string;
  assessmentId: string;
  scoreId: string | null;
  title: string;
  description: string;
  visibility: ReadinessVisibility;
  sortOrder: number;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
};

export type ReadinessRequiredActionItem = {
  id: string;
  assessmentId: string;
  scoreId: string | null;
  title: string;
  description: string | null;
  status: ReadinessRequiredActionStatus;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  visibility: ReadinessVisibility;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
};

export type ReadinessInternalNoteItem = {
  id: string;
  assessmentId: string;
  scoreId: string | null;
  authorUserId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type ReadinessAssessmentCategorySummary = {
  categoryId: string;
  categoryCode: string;
  categoryWeight: number | null;
  score: number | null;
};

export type ReadinessAssessmentListItem = {
  id: string;
  targetType: ReadinessAssessmentTargetType;
  builderCompanyId: string;
  projectId: string | null;
  /** Resolved project name when target is a project. */
  projectName: string | null;
  /** Project cover image URL when available. */
  coverUrl: string | null;
  status: ReadinessScoreStatus;
  overallScore: number | null;
  overallScoreOverridden: boolean;
  evaluatedByUserId: string | null;
  lastEvaluatedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Compact category rows for list cards (no criteria tree). */
  categories: ReadinessAssessmentCategorySummary[];
};

export type ReadinessAssessmentListResponse = PaginatedResponse<ReadinessAssessmentListItem>;

export type ReadinessAssessmentDetail = ReadinessAssessmentListItem & {
  scores: ReadinessScoreItem[];
  recommendations: ReadinessRecommendationItem[];
  requiredActions: ReadinessRequiredActionItem[];
  internalNotes: ReadinessInternalNoteItem[];
};

export type CreateReadinessAssessmentBody = {
  targetType: ReadinessAssessmentTargetType;
  builderCompanyId: string;
  projectId?: string;
};

export type UpdateReadinessAssessmentBody = {
  status?: ReadinessScoreStatus;
  overallScore?: number | null;
  archive?: boolean;
};

export type UpsertReadinessScoreBody = {
  score?: number;
  status?: ReadinessScoreStatus;
  recommendationSummary?: string | null;
};

export type UpsertReadinessCriterionScoreBody = {
  value?: number | null;
  checked?: boolean;
};

export type UpsertReadinessCriterionScoresBatchBody = {
  items: Array<{
    criterionId: string;
    value?: number | null;
    checked?: boolean;
  }>;
};

export type CreateReadinessRecommendationBody = {
  title: string;
  description: string;
  visibility: ReadinessVisibility;
  sortOrder?: number;
  scoreId?: string;
};

export type UpdateReadinessRecommendationBody = {
  title?: string;
  description?: string;
  visibility?: ReadinessVisibility;
  sortOrder?: number;
  scoreId?: string | null;
};

export type CreateReadinessRequiredActionBody = {
  title: string;
  description?: string;
  status?: ReadinessRequiredActionStatus;
  visibility: ReadinessVisibility;
  scoreId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
};

export type UpdateReadinessRequiredActionBody = {
  title?: string;
  description?: string | null;
  status?: ReadinessRequiredActionStatus;
  visibility?: ReadinessVisibility;
  scoreId?: string | null;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
};

export type CreateReadinessInternalNoteBody = {
  body: string;
  scoreId?: string;
};

export type PortalReadinessCriterionItem = {
  criterionId: string;
  code: string;
  parentId: string | null;
  maxPoints: number | null;
  sortOrder: number;
  value: number | null;
  checked: boolean;
  /** value / maxPoints as 0–100 when scored; null for non-scored rows. */
  percent: number | null;
  children: PortalReadinessCriterionItem[];
};

export type PortalReadinessScoreItem = {
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  categoryWeight: number | null;
  score: number | null;
  status: ReadinessScoreStatus;
  recommendationSummary: string | null;
  serviceProviderCategoryId: string | null;
  helpAvailable: boolean;
  criteria: PortalReadinessCriterionItem[];
};

export type PortalReadinessRecommendationItem = {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
  scoreId: string | null;
};

export type PortalReadinessRequiredActionItem = {
  id: string;
  title: string;
  description: string | null;
  status: ReadinessRequiredActionStatus;
  scoreId: string | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
};

export type PortalReadinessAssessmentItem = {
  id: string;
  targetType: ReadinessAssessmentTargetType;
  projectId: string | null;
  projectName: string | null;
  /** Project cover image URL when available. */
  coverUrl: string | null;
  status: ReadinessScoreStatus;
  overallScore: number | null;
  lastEvaluatedAt: string | null;
  scores: PortalReadinessScoreItem[];
  recommendations: PortalReadinessRecommendationItem[];
  requiredActions: PortalReadinessRequiredActionItem[];
};

export type PortalReadinessResponse = {
  data: PortalReadinessAssessmentItem[];
};
