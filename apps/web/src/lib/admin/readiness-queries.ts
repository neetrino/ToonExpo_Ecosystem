import type { AdminReadinessAssessment } from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';
import type { ReadinessStatus, ReadinessTargetType } from '@toonexpo/domain';

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

const adminCategoryScoreSelect = {
  categoryId: true,
  score: true,
  status: true,
  recommendation: true,
  requiredActions: true,
  internalNote: true,
  category: {
    select: {
      key: true,
      name: true,
      serviceCategoryKey: true,
      weight: true,
      sortOrder: true,
    },
  },
} as const;

/** Active categories ordered for assessment forms. */
export async function loadActiveReadinessCategories(): Promise<ReadinessCategoryOption[]> {
  return prisma.readinessCategory.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      key: true,
      name: true,
      weight: true,
      sortOrder: true,
      serviceCategoryKey: true,
    },
  });
}

/** All categories (including inactive) for admin category CRUD. */
export async function listAdminReadinessCategories(): Promise<AdminReadinessCategoryRow[]> {
  return prisma.readinessCategory.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      key: true,
      name: true,
      description: true,
      weight: true,
      sortOrder: true,
      serviceCategoryKey: true,
      active: true,
      updatedAt: true,
    },
  });
}

export async function loadAdminCompanyOptions(): Promise<AdminTargetOption[]> {
  return prisma.company.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
}

export async function loadAdminProjectOptions(): Promise<AdminTargetOption[]> {
  const rows = await prisma.project.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, companyId: true },
  });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    companyId: row.companyId,
  }));
}

export async function listAdminAssessments(
  targetType?: ReadinessTargetType,
): Promise<AdminAssessmentListRow[]> {
  const rows = await prisma.readinessAssessment.findMany({
    where: {
      archivedAt: null,
      ...(targetType ? { targetType } : {}),
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      targetType: true,
      companyId: true,
      projectId: true,
      status: true,
      overallScore: true,
      updatedAt: true,
      company: { select: { name: true } },
      project: { select: { name: true } },
      evaluatedByUser: { select: { email: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    targetType: row.targetType,
    companyId: row.companyId,
    companyName: row.company.name,
    projectId: row.projectId,
    projectName: row.project?.name ?? null,
    status: row.status,
    overallScore: row.overallScore,
    evaluatorEmail: row.evaluatedByUser?.email ?? null,
    updatedAt: row.updatedAt,
  }));
}

export async function getAdminAssessment(
  assessmentId: string,
): Promise<AdminReadinessAssessment | null> {
  const row = await prisma.readinessAssessment.findFirst({
    where: { id: assessmentId, archivedAt: null },
    select: {
      id: true,
      targetType: true,
      companyId: true,
      projectId: true,
      status: true,
      overallScore: true,
      recommendation: true,
      requiredActions: true,
      internalNotes: true,
      responsibleContact: true,
      lastEvaluatedAt: true,
      updatedAt: true,
      evaluatedByUserId: true,
      company: { select: { name: true } },
      project: { select: { name: true } },
      evaluatedByUser: { select: { email: true } },
      categoryScores: {
        orderBy: { category: { sortOrder: 'asc' } },
        select: adminCategoryScoreSelect,
      },
    },
  });

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    targetType: row.targetType,
    companyId: row.companyId,
    companyName: row.company.name,
    projectId: row.projectId,
    projectName: row.project?.name ?? null,
    status: row.status,
    overallScore: row.overallScore,
    recommendation: row.recommendation,
    requiredActions: row.requiredActions,
    internalNotes: row.internalNotes,
    responsibleContact: row.responsibleContact,
    lastEvaluatedAt: row.lastEvaluatedAt,
    updatedAt: row.updatedAt,
    evaluatedByUserId: row.evaluatedByUserId,
    evaluatorEmail: row.evaluatedByUser?.email ?? null,
    categoryScores: row.categoryScores.map((score) => ({
      categoryId: score.categoryId,
      categoryKey: score.category.key,
      categoryName: score.category.name,
      serviceCategoryKey: score.category.serviceCategoryKey,
      score: score.score,
      status: score.status,
      recommendation: score.recommendation,
      requiredActions: score.requiredActions,
      internalNote: score.internalNote,
    })),
  };
}
