/**
 * Idempotent Builder Readiness demo: KPI categories/criteria + assessments.
 */
import {
  ReadinessAssessmentTargetType,
  ReadinessRequiredActionStatus,
  ReadinessScoreStatus,
  ReadinessVisibility,
  type PrismaClient,
} from '../src/index.js';
import { SEED_PLATFORM_ADMIN_ID } from './seed-auth.js';
import { SEED_BUILDERS, SEED_PROJECTS } from './seed-data.js';
import {
  averageReadinessScore,
  SEED_READINESS_CATEGORIES,
  SEED_READINESS_COMPANY_ASSESSMENT_ID,
  SEED_READINESS_COMPANY_SCORES,
  SEED_READINESS_CRITERIA,
  SEED_READINESS_CRITERION_SCORES,
  SEED_READINESS_PROJECT_ASSESSMENT_ID,
  SEED_READINESS_PROJECT_SCORES,
  type ReadinessScoreSeed,
} from './seed-readiness-data.js';

export {
  SEED_READINESS_CATEGORY_IDS,
  SEED_READINESS_COMPANY_ASSESSMENT_ID,
  SEED_READINESS_PROJECT_ASSESSMENT_ID,
} from './seed-readiness-data.js';

const upsertCategories = async (prisma: PrismaClient): Promise<void> => {
  const activeCodes = new Set(SEED_READINESS_CATEGORIES.map((category) => category.code));

  for (const category of SEED_READINESS_CATEGORIES) {
    await prisma.readinessCategory.upsert({
      where: { id: category.id },
      create: {
        id: category.id,
        code: category.code,
        name: category.name,
        description: category.description,
        weight: category.weight,
        sortOrder: category.sortOrder,
        active: true,
      },
      update: {
        code: category.code,
        name: category.name,
        description: category.description,
        weight: category.weight,
        sortOrder: category.sortOrder,
        active: true,
      },
    });
  }

  await prisma.readinessCategory.updateMany({
    where: { code: { notIn: [...activeCodes] } },
    data: { active: false },
  });
};

const upsertCriteria = async (prisma: PrismaClient): Promise<void> => {
  const byCode = new Map(SEED_READINESS_CRITERIA.map((criterion) => [criterion.code, criterion]));
  const roots = SEED_READINESS_CRITERIA.filter((criterion) => criterion.parentCode === null);
  const children = SEED_READINESS_CRITERIA.filter((criterion) => criterion.parentCode !== null);

  for (const criterion of roots) {
    await prisma.readinessCriterion.upsert({
      where: { id: criterion.id },
      create: {
        id: criterion.id,
        code: criterion.code,
        categoryId: criterion.categoryId,
        parentId: null,
        maxPoints: criterion.maxPoints,
        sortOrder: criterion.sortOrder,
        active: true,
      },
      update: {
        code: criterion.code,
        categoryId: criterion.categoryId,
        parentId: null,
        maxPoints: criterion.maxPoints,
        sortOrder: criterion.sortOrder,
        active: true,
      },
    });
  }

  for (const criterion of children) {
    const parent = criterion.parentCode ? byCode.get(criterion.parentCode) : undefined;
    if (!parent) {
      throw new Error(`Missing parent criterion for ${criterion.code}`);
    }
    await prisma.readinessCriterion.upsert({
      where: { id: criterion.id },
      create: {
        id: criterion.id,
        code: criterion.code,
        categoryId: criterion.categoryId,
        parentId: parent.id,
        maxPoints: criterion.maxPoints,
        sortOrder: criterion.sortOrder,
        active: true,
      },
      update: {
        code: criterion.code,
        categoryId: criterion.categoryId,
        parentId: parent.id,
        maxPoints: criterion.maxPoints,
        sortOrder: criterion.sortOrder,
        active: true,
      },
    });
  }

  await prisma.readinessCriterion.updateMany({
    where: { code: { notIn: SEED_READINESS_CRITERIA.map((criterion) => criterion.code) } },
    data: { active: false },
  });
};

const createAssessmentBundle = async (
  prisma: PrismaClient,
  input: {
    assessmentId: string;
    targetType: ReadinessAssessmentTargetType;
    builderCompanyId: string;
    projectId: string | null;
    status: ReadinessScoreStatus;
    overallScore: number;
    scores: ReadinessScoreSeed[];
    recommendationTitle: string;
    recommendationDescription: string;
    actionTitle: string;
    actionDescription: string;
    internalNote: string;
  },
): Promise<void> => {
  const evaluatedAt = new Date();
  const criterionByCode = new Map(
    SEED_READINESS_CRITERIA.map((criterion) => [criterion.code, criterion]),
  );

  await prisma.readinessAssessment.create({
    data: {
      id: input.assessmentId,
      targetType: input.targetType,
      builderCompanyId: input.builderCompanyId,
      projectId: input.projectId,
      status: input.status,
      overallScore: input.overallScore,
      overallScoreOverridden: false,
      evaluatedByUserId: SEED_PLATFORM_ADMIN_ID,
      lastEvaluatedAt: evaluatedAt,
      scores: {
        create: input.scores.map((score) => ({
          categoryId: score.categoryId,
          score: score.score,
          status: score.status,
          recommendationSummary: score.recommendationSummary,
          evaluatedByUserId: SEED_PLATFORM_ADMIN_ID,
          evaluatedAt,
        })),
      },
      criterionScores: {
        create: SEED_READINESS_CRITERION_SCORES.map((score) => {
          const criterion = criterionByCode.get(score.criterionCode);
          if (!criterion) {
            throw new Error(`Unknown criterion code: ${score.criterionCode}`);
          }
          return {
            criterionId: criterion.id,
            value: score.value,
            checked: score.checked,
          };
        }),
      },
      recommendations: {
        create: [
          {
            title: input.recommendationTitle,
            description: input.recommendationDescription,
            visibility: ReadinessVisibility.builder_visible,
            sortOrder: 0,
            createdByUserId: SEED_PLATFORM_ADMIN_ID,
          },
          {
            title: 'Internal evaluator note summary',
            description: 'Keep pressure on packaging and team coverage before go-live.',
            visibility: ReadinessVisibility.internal_only,
            sortOrder: 1,
            createdByUserId: SEED_PLATFORM_ADMIN_ID,
          },
        ],
      },
      requiredActions: {
        create: [
          {
            title: input.actionTitle,
            description: input.actionDescription,
            status: ReadinessRequiredActionStatus.open,
            visibility: ReadinessVisibility.builder_visible,
            createdByUserId: SEED_PLATFORM_ADMIN_ID,
          },
        ],
      },
      internalNotes: {
        create: [
          {
            body: input.internalNote,
            authorUserId: SEED_PLATFORM_ADMIN_ID,
          },
        ],
      },
    },
  });
};

/**
 * Seeds readiness KPI categories/criteria and demo assessments.
 */
export const upsertSeedReadiness = async (prisma: PrismaClient): Promise<number> => {
  const builderCompanyId = SEED_BUILDERS[0]!.id;
  const projectId = SEED_PROJECTS[0]!.id;

  await upsertCategories(prisma);
  await upsertCriteria(prisma);

  await prisma.readinessAssessment.deleteMany({
    where: {
      id: {
        in: [SEED_READINESS_COMPANY_ASSESSMENT_ID, SEED_READINESS_PROJECT_ASSESSMENT_ID],
      },
    },
  });

  await createAssessmentBundle(prisma, {
    assessmentId: SEED_READINESS_COMPANY_ASSESSMENT_ID,
    targetType: ReadinessAssessmentTargetType.builder_company,
    builderCompanyId,
    projectId: null,
    status: ReadinessScoreStatus.in_progress,
    overallScore: averageReadinessScore(SEED_READINESS_COMPANY_SCORES),
    scores: SEED_READINESS_COMPANY_SCORES,
    recommendationTitle: 'Clarify payment options and team coverage',
    recommendationDescription:
      'Document prepayment terms and ensure sales-team capacity for expo week.',
    actionTitle: 'Complete prepayment criterion',
    actionDescription: 'Confirm whether prepayment is offered and score the criterion.',
    internalNote: 'Seed demo: company-level KPI assessment for Glendale Homes.',
  });

  await createAssessmentBundle(prisma, {
    assessmentId: SEED_READINESS_PROJECT_ASSESSMENT_ID,
    targetType: ReadinessAssessmentTargetType.project,
    builderCompanyId,
    projectId,
    status: ReadinessScoreStatus.in_progress,
    overallScore: averageReadinessScore(SEED_READINESS_PROJECT_SCORES),
    scores: SEED_READINESS_PROJECT_SCORES,
    recommendationTitle: 'Finish packaging gaps before listing launch',
    recommendationDescription:
      'Raise apartment interactive materials and keep booth quality locked.',
    actionTitle: 'Review apartment interactive materials score',
    actionDescription: 'Upload remaining interactive apartment assets and re-score.',
    internalNote: 'Seed demo: project KPI assessment for Northern Avenue Residences.',
  });

  return 2;
};
