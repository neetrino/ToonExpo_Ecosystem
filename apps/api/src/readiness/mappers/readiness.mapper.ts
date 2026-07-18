import type {
  PortalReadinessAssessmentItem,
  PortalReadinessRecommendationItem,
  PortalReadinessRequiredActionItem,
  PortalReadinessScoreItem,
  ReadinessAssessmentDetail,
  ReadinessAssessmentListItem,
  ReadinessCategoryItem,
  ReadinessInternalNoteItem,
  ReadinessRecommendationItem,
  ReadinessRequiredActionItem,
  ReadinessScoreItem,
} from "@toonexpo/contracts";
import type { Prisma } from "@toonexpo/db";

type ReadinessCategory = Prisma.ReadinessCategoryGetPayload<object>;
type ReadinessAssessment = Prisma.ReadinessAssessmentGetPayload<object>;
type ReadinessScore = Prisma.ReadinessScoreGetPayload<object>;
type ReadinessRecommendation = Prisma.ReadinessRecommendationGetPayload<object>;
type ReadinessRequiredAction = Prisma.ReadinessRequiredActionGetPayload<object>;
type ReadinessInternalNote = Prisma.ReadinessInternalNoteGetPayload<object>;

const toIso = (value: Date): string => value.toISOString();

export const toReadinessCategoryItem = (
  category: ReadinessCategory,
): ReadinessCategoryItem => ({
  id: category.id,
  name: category.name,
  description: category.description,
  weight: category.weight,
  sortOrder: category.sortOrder,
  serviceProviderCategoryId: category.serviceProviderCategoryId,
  active: category.active,
  createdAt: toIso(category.createdAt),
  updatedAt: toIso(category.updatedAt),
});

export const toReadinessAssessmentListItem = (
  assessment: ReadinessAssessment,
): ReadinessAssessmentListItem => ({
  id: assessment.id,
  targetType: assessment.targetType,
  builderCompanyId: assessment.builderCompanyId,
  projectId: assessment.projectId,
  status: assessment.status,
  overallScore: assessment.overallScore,
  overallScoreOverridden: assessment.overallScoreOverridden,
  evaluatedByUserId: assessment.evaluatedByUserId,
  lastEvaluatedAt: assessment.lastEvaluatedAt
    ? toIso(assessment.lastEvaluatedAt)
    : null,
  archivedAt: assessment.archivedAt ? toIso(assessment.archivedAt) : null,
  createdAt: toIso(assessment.createdAt),
  updatedAt: toIso(assessment.updatedAt),
});

type ScoreWithCategory = ReadinessScore & { category: ReadinessCategory };

export const assessmentDetailInclude = {
  scores: {
    include: { category: true },
    orderBy: [{ category: { sortOrder: "asc" as const } }, { category: { name: "asc" as const } }],
  },
  recommendations: { orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }] },
  requiredActions: { orderBy: [{ createdAt: "asc" as const }] },
  internalNotes: { orderBy: [{ createdAt: "desc" as const }] },
} satisfies Prisma.ReadinessAssessmentInclude;

export type AssessmentDetailRecord = Prisma.ReadinessAssessmentGetPayload<{
  include: typeof assessmentDetailInclude;
}>;

export const toReadinessScoreItem = (score: ScoreWithCategory): ReadinessScoreItem => ({
  id: score.id,
  categoryId: score.categoryId,
  categoryName: score.category.name,
  score: score.score,
  status: score.status,
  recommendationSummary: score.recommendationSummary,
  evaluatedByUserId: score.evaluatedByUserId,
  evaluatedAt: score.evaluatedAt ? toIso(score.evaluatedAt) : null,
  createdAt: toIso(score.createdAt),
  updatedAt: toIso(score.updatedAt),
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
): ReadinessAssessmentDetail => ({
  ...toReadinessAssessmentListItem(assessment),
  scores: assessment.scores.map(toReadinessScoreItem),
  recommendations: assessment.recommendations.map(toReadinessRecommendationItem),
  requiredActions: assessment.requiredActions.map(toReadinessRequiredActionItem),
  internalNotes: assessment.internalNotes.map(toReadinessInternalNoteItem),
});

export const toPortalReadinessScoreItem = (
  score: ScoreWithCategory,
): PortalReadinessScoreItem => ({
  categoryId: score.categoryId,
  categoryName: score.category.name,
  score: score.score,
  status: score.status,
  recommendationSummary: score.recommendationSummary,
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
  recommendations: ReadinessRecommendation[];
  requiredActions: ReadinessRequiredAction[];
};

export const toPortalReadinessAssessmentItem = (
  assessment: PortalAssessmentSource,
): PortalReadinessAssessmentItem => ({
  id: assessment.id,
  targetType: assessment.targetType,
  projectId: assessment.projectId,
  projectName: assessment.project?.name ?? null,
  status: assessment.status,
  overallScore: assessment.overallScore,
  lastEvaluatedAt: assessment.lastEvaluatedAt
    ? toIso(assessment.lastEvaluatedAt)
    : null,
  scores: assessment.scores.map(toPortalReadinessScoreItem),
  recommendations: assessment.recommendations.map(toPortalReadinessRecommendationItem),
  requiredActions: assessment.requiredActions.map(toPortalReadinessRequiredActionItem),
});
