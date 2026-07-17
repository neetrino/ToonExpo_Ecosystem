import type { BuilderReadinessAssessment } from '@toonexpo/contracts';
import type { ReadinessStatus, ReadinessTargetType } from '@toonexpo/domain';

import { serverApiRequest } from '@/lib/api/server';

import { filterProvidersForServiceCategory, type ProviderSuggestionInput } from './provider-match';
import { isWeakReadinessStatus } from './score';

function toBuilderAssessment(row: {
  id: string;
  targetType: ReadinessTargetType;
  companyId: string;
  projectId: string | null;
  projectName: string | null;
  status: ReadinessStatus;
  overallScore: number | null;
  recommendation: string | null;
  requiredActions: string | null;
  responsibleContact: string | null;
  lastEvaluatedAt: Date | null;
  updatedAt: Date;
  categoryScores: BuilderReadinessAssessment['categoryScores'];
}): BuilderReadinessAssessment {
  return {
    id: row.id,
    targetType: row.targetType,
    companyId: row.companyId,
    projectId: row.projectId,
    projectName: row.projectName,
    status: row.status,
    overallScore: row.overallScore,
    recommendation: row.recommendation,
    requiredActions: row.requiredActions,
    responsibleContact: row.responsibleContact,
    lastEvaluatedAt: row.lastEvaluatedAt,
    updatedAt: row.updatedAt,
    categoryScores: row.categoryScores,
  };
}
/**
 * Builder-facing select — intentionally omits internalNotes / internalNote.
 * Visibility is enforced at the query layer, not only in the UI.
 */
function mapBuilderRow(row: {
  id: string;
  targetType: BuilderReadinessAssessment['targetType'];
  companyId: string;
  projectId: string | null;
  status: BuilderReadinessAssessment['status'];
  overallScore: number | null;
  recommendation: string | null;
  requiredActions: string | null;
  responsibleContact: string | null;
  lastEvaluatedAt: Date | null;
  updatedAt: Date;
  project: { name: string } | null;
  categoryScores: Array<{
    categoryId: string;
    score: number | null;
    status: BuilderReadinessAssessment['status'];
    recommendation: string | null;
    requiredActions: string | null;
    category: {
      key: string;
      name: string;
      serviceCategoryKey: string | null;
    };
  }>;
}): BuilderReadinessAssessment {
  return toBuilderAssessment({
    id: row.id,
    targetType: row.targetType,
    companyId: row.companyId,
    projectId: row.projectId,
    projectName: row.project?.name ?? null,
    status: row.status,
    overallScore: row.overallScore,
    recommendation: row.recommendation,
    requiredActions: row.requiredActions,
    responsibleContact: row.responsibleContact,
    lastEvaluatedAt: row.lastEvaluatedAt,
    updatedAt: row.updatedAt,
    categoryScores: row.categoryScores.map((score) => ({
      categoryId: score.categoryId,
      categoryKey: score.category.key,
      categoryName: score.category.name,
      serviceCategoryKey: score.category.serviceCategoryKey,
      score: score.score,
      status: score.status,
      recommendation: score.recommendation,
      requiredActions: score.requiredActions,
    })),
  });
}

/**
 * Latest non-archived assessments for the builder's company only.
 * Returns [] when the company has no assessments (including foreign company ids).
 */
export async function listBuilderAssessments(
  companyId: string,
): Promise<BuilderReadinessAssessment[]> {
  void companyId;
  const rows = await serverApiRequest<Parameters<typeof mapBuilderRow>[0][]>('/builder/readiness');

  return rows.map((row) =>
    mapBuilderRow({
      ...row,
      lastEvaluatedAt: row.lastEvaluatedAt ? new Date(row.lastEvaluatedAt) : null,
      updatedAt: new Date(row.updatedAt),
    }),
  );
}

/** Published SERVICE_COMPANY partners for readiness provider suggestions. */
export async function loadPublishedServiceProviders(): Promise<ProviderSuggestionInput[]> {
  return serverApiRequest<ProviderSuggestionInput[]>('/builder/readiness/providers');
}

export type CategoryProviderGroup = {
  categoryKey: string;
  categoryName: string;
  serviceCategoryKey: string;
  providers: ProviderSuggestionInput[];
};

/** Groups weak categories with matching published service providers. */
export function buildProviderSuggestions(
  assessments: readonly BuilderReadinessAssessment[],
  providers: readonly ProviderSuggestionInput[],
): CategoryProviderGroup[] {
  const groups: CategoryProviderGroup[] = [];
  const seen = new Set<string>();

  for (const assessment of assessments) {
    for (const score of assessment.categoryScores) {
      if (!isWeakReadinessStatus(score.status) || !score.serviceCategoryKey) {
        continue;
      }
      if (seen.has(score.categoryKey)) {
        continue;
      }
      seen.add(score.categoryKey);
      const matched = filterProvidersForServiceCategory(providers, score.serviceCategoryKey);
      if (matched.length === 0) {
        continue;
      }
      groups.push({
        categoryKey: score.categoryKey,
        categoryName: score.categoryName,
        serviceCategoryKey: score.serviceCategoryKey,
        providers: matched,
      });
    }
  }

  return groups;
}

/**
 * Pure helper used in tests: strips any accidental internal fields from a
 * builder-facing assessment object built from a mock that included them.
 */
export function assertBuilderAssessmentPublicFields(
  assessment: Record<string, unknown>,
): BuilderReadinessAssessment {
  const { internalNotes: _notes, ...rest } = assessment;
  const categoryScores = Array.isArray(rest.categoryScores)
    ? rest.categoryScores.map((raw) => {
        const score = raw as Record<string, unknown>;
        const { internalNote: _note, ...publicScore } = score;
        return publicScore;
      })
    : [];

  const publicAssessment = { ...rest, categoryScores } as BuilderReadinessAssessment;

  if ('internalNotes' in publicAssessment) {
    throw new Error('internalNotes must not appear on builder assessment');
  }
  for (const score of publicAssessment.categoryScores) {
    if ('internalNote' in score) {
      throw new Error('internalNote must not appear on builder category score');
    }
  }

  return publicAssessment;
}
