import type {
  PortalReadinessAssessmentItem,
  PortalReadinessCriterionItem,
  PortalReadinessRecommendationItem,
  PortalReadinessRequiredActionItem,
  PortalReadinessScoreItem,
  ReadinessAssessmentDetail,
  ReadinessAssessmentListItem,
  ReadinessCategoryItem,
  ReadinessCriterionScoreItem,
  ReadinessInternalNoteItem,
  ReadinessRecommendationItem,
  ReadinessRequiredActionItem,
  ReadinessScoreItem,
} from '@toonexpo/contracts';
import type { Prisma } from '@toonexpo/db';

type ReadinessCategory = Prisma.ReadinessCategoryGetPayload<object>;
type ReadinessAssessment = Prisma.ReadinessAssessmentGetPayload<object>;
type ReadinessScore = Prisma.ReadinessScoreGetPayload<object>;
type ReadinessRecommendation = Prisma.ReadinessRecommendationGetPayload<object>;
type ReadinessRequiredAction = Prisma.ReadinessRequiredActionGetPayload<object>;
type ReadinessInternalNote = Prisma.ReadinessInternalNoteGetPayload<object>;
type ReadinessCriterion = Prisma.ReadinessCriterionGetPayload<object>;
type ReadinessCriterionScore = Prisma.ReadinessCriterionScoreGetPayload<object>;

const toIso = (value: Date): string => value.toISOString();

const criterionPercent = (value: number | null, maxPoints: number | null): number | null => {
  if (value === null || maxPoints === null || maxPoints <= 0) {
    return null;
  }
  return Math.max(0, Math.min(100, Math.round((value / maxPoints) * 100)));
};

export const toReadinessCategoryItem = (category: ReadinessCategory): ReadinessCategoryItem => ({
  id: category.id,
  code: category.code,
  name: category.name,
  description: category.description,
  weight: category.weight,
  sortOrder: category.sortOrder,
  serviceProviderCategoryId: category.serviceProviderCategoryId,
  active: category.active,
  createdAt: toIso(category.createdAt),
  updatedAt: toIso(category.updatedAt),
});

type ScoreWithCategory = ReadinessScore & { category: ReadinessCategory };

type ProjectWithCover = {
  name: string;
  coverMedia: { fileUrl: string; thumbnailUrl: string | null } | null;
};

type AssessmentListRecord = ReadinessAssessment & {
  scores?: ScoreWithCategory[];
  project?: ProjectWithCover | null;
};

export const assessmentListInclude = {
  scores: {
    include: { category: true },
    orderBy: [{ category: { sortOrder: 'asc' as const } }, { category: { name: 'asc' as const } }],
  },
  project: {
    select: {
      name: true,
      coverMedia: { select: { fileUrl: true, thumbnailUrl: true } },
    },
  },
} satisfies Prisma.ReadinessAssessmentInclude;

export const toReadinessAssessmentListItem = (
  assessment: AssessmentListRecord,
): ReadinessAssessmentListItem => {
  const cover =
    assessment.project?.coverMedia?.thumbnailUrl ?? assessment.project?.coverMedia?.fileUrl ?? null;

  return {
    id: assessment.id,
    targetType: assessment.targetType,
    builderCompanyId: assessment.builderCompanyId,
    projectId: assessment.projectId,
    projectName: assessment.project?.name ?? null,
    coverUrl: cover,
    status: assessment.status,
    overallScore: assessment.overallScore,
    overallScoreOverridden: assessment.overallScoreOverridden,
    evaluatedByUserId: assessment.evaluatedByUserId,
    lastEvaluatedAt: assessment.lastEvaluatedAt ? toIso(assessment.lastEvaluatedAt) : null,
    archivedAt: assessment.archivedAt ? toIso(assessment.archivedAt) : null,
    createdAt: toIso(assessment.createdAt),
    updatedAt: toIso(assessment.updatedAt),
    categories: (assessment.scores ?? []).map((score) => ({
      categoryId: score.categoryId,
      categoryCode: score.category.code,
      categoryWeight: score.category.weight,
      score: score.score,
    })),
  };
};

type CriterionScoreWithCriterion = ReadinessCriterionScore & {
  criterion: ReadinessCriterion;
};

export const assessmentDetailInclude = {
  scores: {
    include: { category: true },
    orderBy: [{ category: { sortOrder: 'asc' as const } }, { category: { name: 'asc' as const } }],
  },
  criterionScores: {
    include: { criterion: true },
  },
  recommendations: { orderBy: [{ sortOrder: 'asc' as const }, { createdAt: 'asc' as const }] },
  requiredActions: { orderBy: [{ createdAt: 'asc' as const }] },
  internalNotes: { orderBy: [{ createdAt: 'desc' as const }] },
} satisfies Prisma.ReadinessAssessmentInclude;

export type AssessmentDetailRecord = Prisma.ReadinessAssessmentGetPayload<{
  include: typeof assessmentDetailInclude;
}>;

const toCriterionScoreNode = (
  criterion: ReadinessCriterion,
  scoreByCriterionId: ReadonlyMap<string, CriterionScoreWithCriterion>,
  childrenByParentId: ReadonlyMap<string, ReadinessCriterion[]>,
  ancestors: ReadonlySet<string> = new Set(),
): ReadinessCriterionScoreItem => {
  const score = scoreByCriterionId.get(criterion.id);
  if (ancestors.has(criterion.id)) {
    return {
      scoreId: score?.id ?? null,
      criterionId: criterion.id,
      code: criterion.code,
      parentId: criterion.parentId,
      maxPoints: criterion.maxPoints,
      sortOrder: criterion.sortOrder,
      value: score?.value ?? null,
      checked: score?.checked ?? false,
      children: [],
    };
  }

  const nextAncestors = new Set(ancestors);
  nextAncestors.add(criterion.id);
  const children = childrenByParentId.get(criterion.id) ?? [];

  return {
    scoreId: score?.id ?? null,
    criterionId: criterion.id,
    code: criterion.code,
    parentId: criterion.parentId,
    maxPoints: criterion.maxPoints,
    sortOrder: criterion.sortOrder,
    value: score?.value ?? null,
    checked: score?.checked ?? false,
    children: children.map((child) =>
      toCriterionScoreNode(child, scoreByCriterionId, childrenByParentId, nextAncestors),
    ),
  };
};

export const buildCriterionTreeForCategory = (
  categoryId: string,
  criteria: readonly ReadinessCriterion[],
  criterionScores: readonly CriterionScoreWithCriterion[],
): ReadinessCriterionScoreItem[] => {
  const categoryCriteria = criteria
    .filter((criterion) => criterion.categoryId === categoryId && criterion.active)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code));

  const childrenByParentId = new Map<string, ReadinessCriterion[]>();
  for (const criterion of categoryCriteria) {
    if (!criterion.parentId) {
      continue;
    }
    const list = childrenByParentId.get(criterion.parentId) ?? [];
    list.push(criterion);
    childrenByParentId.set(criterion.parentId, list);
  }

  const scoreByCriterionId = new Map(criterionScores.map((row) => [row.criterionId, row] as const));

  return categoryCriteria
    .filter((criterion) => criterion.parentId === null)
    .map((criterion) => toCriterionScoreNode(criterion, scoreByCriterionId, childrenByParentId));
};

const toPortalCriterionNode = (
  item: ReadinessCriterionScoreItem,
): PortalReadinessCriterionItem => ({
  criterionId: item.criterionId,
  code: item.code,
  parentId: item.parentId,
  maxPoints: item.maxPoints,
  sortOrder: item.sortOrder,
  value: item.value,
  checked: item.checked,
  percent: criterionPercent(item.value, item.maxPoints),
  children: item.children.map(toPortalCriterionNode),
});

export const toReadinessScoreItem = (
  score: ScoreWithCategory,
  criteria: ReadinessCriterionScoreItem[] = [],
): ReadinessScoreItem => ({
  id: score.id,
  categoryId: score.categoryId,
  categoryCode: score.category.code,
  categoryName: score.category.name,
  categoryWeight: score.category.weight,
  score: score.score,
  status: score.status,
  recommendationSummary: score.recommendationSummary,
  evaluatedByUserId: score.evaluatedByUserId,
  evaluatedAt: score.evaluatedAt ? toIso(score.evaluatedAt) : null,
  createdAt: toIso(score.createdAt),
  updatedAt: toIso(score.updatedAt),
  criteria,
});

export const toReadinessRecommendationItem = (
  item: ReadinessRecommendation,
): ReadinessRecommendationItem => ({
  id: item.id,
  assessmentId: item.assessmentId,
  scoreId: item.scoreId,
  title: item.title,
  description: item.description,
  visibility: item.visibility,
  sortOrder: item.sortOrder,
  createdByUserId: item.createdByUserId,
  createdAt: toIso(item.createdAt),
  updatedAt: toIso(item.updatedAt),
});

export const toReadinessRequiredActionItem = (
  item: ReadinessRequiredAction,
): ReadinessRequiredActionItem => ({
  id: item.id,
  assessmentId: item.assessmentId,
  scoreId: item.scoreId,
  title: item.title,
  description: item.description,
  status: item.status,
  relatedEntityType: item.relatedEntityType,
  relatedEntityId: item.relatedEntityId,
  visibility: item.visibility,
  createdByUserId: item.createdByUserId,
  createdAt: toIso(item.createdAt),
  updatedAt: toIso(item.updatedAt),
});

export const toReadinessInternalNoteItem = (
  note: ReadinessInternalNote,
): ReadinessInternalNoteItem => ({
  id: note.id,
  assessmentId: note.assessmentId,
  scoreId: note.scoreId,
  authorUserId: note.authorUserId,
  body: note.body,
  createdAt: toIso(note.createdAt),
  updatedAt: toIso(note.updatedAt),
});

export const toReadinessAssessmentDetail = (
  assessment: AssessmentDetailRecord,
  catalogCriteria: readonly ReadinessCriterion[],
): ReadinessAssessmentDetail => {
  const criterionScores = assessment.criterionScores as CriterionScoreWithCriterion[];

  return {
    ...toReadinessAssessmentListItem(assessment),
    scores: assessment.scores.map((score) =>
      toReadinessScoreItem(
        score,
        buildCriterionTreeForCategory(score.categoryId, catalogCriteria, criterionScores),
      ),
    ),
    recommendations: assessment.recommendations.map(toReadinessRecommendationItem),
    requiredActions: assessment.requiredActions.map(toReadinessRequiredActionItem),
    internalNotes: assessment.internalNotes.map(toReadinessInternalNoteItem),
  };
};

export const toPortalReadinessScoreItem = (
  score: ScoreWithCategory,
  helpAvailable: boolean,
  criteria: ReadinessCriterionScoreItem[] = [],
): PortalReadinessScoreItem => ({
  categoryId: score.categoryId,
  categoryCode: score.category.code,
  categoryName: score.category.name,
  categoryWeight: score.category.weight,
  score: score.score,
  status: score.status,
  recommendationSummary: score.recommendationSummary,
  serviceProviderCategoryId: score.category.serviceProviderCategoryId,
  helpAvailable,
  criteria: criteria.map(toPortalCriterionNode),
});

export const toPortalReadinessRecommendationItem = (
  item: ReadinessRecommendation,
): PortalReadinessRecommendationItem => ({
  id: item.id,
  title: item.title,
  description: item.description,
  sortOrder: item.sortOrder,
  scoreId: item.scoreId,
});

export const toPortalReadinessRequiredActionItem = (
  item: ReadinessRequiredAction,
): PortalReadinessRequiredActionItem => ({
  id: item.id,
  title: item.title,
  description: item.description,
  status: item.status,
  scoreId: item.scoreId,
  relatedEntityType: item.relatedEntityType,
  relatedEntityId: item.relatedEntityId,
});

type PortalAssessmentSource = ReadinessAssessment & {
  project: { name: string } | null;
  scores: ScoreWithCategory[];
  criterionScores: CriterionScoreWithCriterion[];
  recommendations: ReadinessRecommendation[];
  requiredActions: ReadinessRequiredAction[];
};

export const toPortalReadinessAssessmentItem = (
  assessment: PortalAssessmentSource,
  helpAvailabilityByCategoryId: ReadonlyMap<string, boolean>,
  catalogCriteria: readonly ReadinessCriterion[],
): PortalReadinessAssessmentItem => ({
  id: assessment.id,
  targetType: assessment.targetType,
  projectId: assessment.projectId,
  projectName: assessment.project?.name ?? null,
  status: assessment.status,
  overallScore: assessment.overallScore,
  lastEvaluatedAt: assessment.lastEvaluatedAt ? toIso(assessment.lastEvaluatedAt) : null,
  scores: assessment.scores.map((score) =>
    toPortalReadinessScoreItem(
      score,
      helpAvailabilityByCategoryId.get(score.categoryId) ?? false,
      buildCriterionTreeForCategory(score.categoryId, catalogCriteria, assessment.criterionScores),
    ),
  ),
  recommendations: assessment.recommendations.map(toPortalReadinessRecommendationItem),
  requiredActions: assessment.requiredActions.map(toPortalReadinessRequiredActionItem),
});
