/**
 * Idempotent Builder Readiness demo: categories + company/project assessments
 * for the seed Glendale builder (visible in Admin and Builder portal).
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
  for (const category of SEED_READINESS_CATEGORIES) {
    await prisma.readinessCategory.upsert({
      where: { id: category.id },
      create: {
        id: category.id,
        name: category.name,
        description: category.description,
        weight: category.weight,
        sortOrder: category.sortOrder,
        active: true,
      },
      update: {
        name: category.name,
        description: category.description,
        weight: category.weight,
        sortOrder: category.sortOrder,
        active: true,
      },
    });
  }
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
            description: 'Keep pressure on media and visual map before go-live.',
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
 * Seeds readiness categories and demo assessments for Glendale / Northern Avenue.
 */
export const upsertSeedReadiness = async (prisma: PrismaClient): Promise<number> => {
  const builderCompanyId = SEED_BUILDERS[0]!.id;
  const projectId = SEED_PROJECTS[0]!.id;

  await upsertCategories(prisma);

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
    recommendationTitle: 'Improve media and visual map coverage',
    recommendationDescription:
      'Prioritize gallery renders and Building A hotspots so buyers get a complete tour.',
    actionTitle: 'Upload missing Building A floor hotspots',
    actionDescription: 'Add interactive markers for floors 1–5 before the next review.',
    internalNote: 'Seed demo: company-level assessment for Glendale Homes.',
  });

  await createAssessmentBundle(prisma, {
    assessmentId: SEED_READINESS_PROJECT_ASSESSMENT_ID,
    targetType: ReadinessAssessmentTargetType.project,
    builderCompanyId,
    projectId,
    status: ReadinessScoreStatus.in_progress,
    overallScore: averageReadinessScore(SEED_READINESS_PROJECT_SCORES),
    scores: SEED_READINESS_PROJECT_SCORES,
    recommendationTitle: 'Finish apartment plans and booth visuals',
    recommendationDescription:
      'Complete remaining floor plans and prepare Northern Avenue booth materials.',
    actionTitle: 'Upload remaining floor plans for Building B',
    actionDescription: 'Add plan images for floors that still show empty slots.',
    internalNote: 'Seed demo: project assessment for Northern Avenue Residences.',
  });

  return 2;
};
