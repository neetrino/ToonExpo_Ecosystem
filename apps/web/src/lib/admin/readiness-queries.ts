import type { AdminReadinessAssessment } from '@toonexpo/contracts';
import type { ReadinessStatus, ReadinessTargetType } from '@toonexpo/domain';

import { adminApiRequest } from './admin-api';

export type AdminAssessmentListRow = {
  id: string;
  targetType: ReadinessTargetType;
  companyId: string;
  companyName: string;
  projectId: string | null;
  projectName: string | null;
  status: ReadinessStatus;
  overallScore: number | null;
  evaluatorEmail: string | null;
  updatedAt: Date;
};

export type ReadinessCategoryOption = {
  id: string;
  key: string;
  name: string;
  weight: number | null;
  sortOrder: number;
  serviceCategoryKey: string | null;
};

export type AdminReadinessCategoryRow = ReadinessCategoryOption & {
  description: string | null;
  active: boolean;
  updatedAt: Date;
};

export type AdminTargetOption = {
  id: string;
  name: string;
  companyId?: string;
};

export function loadActiveReadinessCategories(): Promise<ReadinessCategoryOption[]> {
  return adminApiRequest('/readiness/categories?activeOnly=true');
}

export function listAdminReadinessCategories(): Promise<AdminReadinessCategoryRow[]> {
  return adminApiRequest('/readiness/categories');
}

export function loadAdminCompanyOptions(): Promise<AdminTargetOption[]> {
  return adminApiRequest('/readiness/company-options');
}

export function loadAdminProjectOptions(): Promise<AdminTargetOption[]> {
  return adminApiRequest('/readiness/project-options');
}

export function listAdminAssessments(
  targetType?: ReadinessTargetType,
): Promise<AdminAssessmentListRow[]> {
  const query = targetType ? `?targetType=${encodeURIComponent(targetType)}` : '';
  return adminApiRequest(`/readiness/assessments${query}`);
}

export function getAdminAssessment(assessmentId: string): Promise<AdminReadinessAssessment | null> {
  return adminApiRequest(`/readiness/assessments/${encodeURIComponent(assessmentId)}`);
}
