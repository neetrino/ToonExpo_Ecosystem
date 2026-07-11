import type { AssessmentUpsertInput } from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';

import { loadActiveReadinessCategories, type ReadinessCategoryOption } from './readiness-queries';
import { type AdminMutationResult } from './mutation-result';
import { computeOverallScore } from '@/lib/readiness/score';

type ResolvedTarget = {
  companyId: string;
  projectId: string | null;
};

async function resolveAssessmentTarget(
  input: AssessmentUpsertInput,
): Promise<AdminMutationResult<ResolvedTarget>> {
  if (input.targetType === 'BUILDER_COMPANY') {
    if (!input.companyId) {
      return { ok: false, errorKey: 'invalidInput' };
    }
    const company = await prisma.company.findUnique({
      where: { id: input.companyId },
      select: { id: true },
    });
    if (!company) {
      return { ok: false, errorKey: 'notFound' };
    }
    return { ok: true, companyId: company.id, projectId: null };
  }

  if (!input.projectId) {
    return { ok: false, errorKey: 'invalidInput' };
  }
  const project = await prisma.project.findUnique({
    where: { id: input.projectId },
    select: { id: true, companyId: true },
  });
  if (!project) {
    return { ok: false, errorKey: 'notFound' };
  }
  return { ok: true, companyId: project.companyId, projectId: project.id };
}

function overallFromScores(
  categoryScores: AssessmentUpsertInput['categoryScores'],
  categories: ReadinessCategoryOption[],
): number | null {
  const weightById = new Map(categories.map((category) => [category.id, category.weight]));
  return computeOverallScore(
    categoryScores
      .filter((entry) => entry.score !== undefined)
      .map((entry) => ({
        score: entry.score as number,
        weight: weightById.get(entry.categoryId) ?? null,
      })),
  );
}

export async function upsertAssessment(
  input: AssessmentUpsertInput,
  evaluatorUserId: string,
): Promise<AdminMutationResult<{ assessmentId: string }>> {
  const target = await resolveAssessmentTarget(input);
  if (!target.ok) {
    return target;
  }

  const categories = await loadActiveReadinessCategories();
  const categoryIds = new Set(categories.map((category) => category.id));
  if (input.categoryScores.some((score) => !categoryIds.has(score.categoryId))) {
    return { ok: false, errorKey: 'invalidInput' };
  }

  const overallScore = overallFromScores(input.categoryScores, categories);
  const now = new Date();

  if (input.assessmentId) {
    return updateExistingAssessment(input, target, evaluatorUserId, overallScore, now);
  }

  const created = await prisma.readinessAssessment.create({
    data: {
      targetType: input.targetType,
      companyId: target.companyId,
      projectId: target.projectId,
      status: input.status,
      overallScore,
      evaluatedByUserId: evaluatorUserId,
      lastEvaluatedAt: now,
      responsibleContact: input.responsibleContact ?? null,
      recommendation: input.recommendation ?? null,
      requiredActions: input.requiredActions ?? null,
      internalNotes: input.internalNotes ?? null,
      categoryScores: {
        create: input.categoryScores.map((score) => ({
          categoryId: score.categoryId,
          score: score.score ?? null,
          status: score.status,
          recommendation: score.recommendation ?? null,
          requiredActions: score.requiredActions ?? null,
          internalNote: score.internalNote ?? null,
          evaluatedByUserId: evaluatorUserId,
          evaluatedAt: now,
        })),
      },
    },
    select: { id: true },
  });

  return { ok: true, assessmentId: created.id };
}

async function updateExistingAssessment(
  input: AssessmentUpsertInput,
  target: ResolvedTarget,
  evaluatorUserId: string,
  overallScore: number | null,
  now: Date,
): Promise<AdminMutationResult<{ assessmentId: string }>> {
  const assessmentId = input.assessmentId as string;
  const existing = await prisma.readinessAssessment.findFirst({
    where: { id: assessmentId, archivedAt: null },
    select: { id: true },
  });
  if (!existing) {
    return { ok: false, errorKey: 'notFound' };
  }

  await prisma.$transaction([
    prisma.readinessAssessment.update({
      where: { id: assessmentId },
      data: {
        targetType: input.targetType,
        companyId: target.companyId,
        projectId: target.projectId,
        status: input.status,
        overallScore,
        evaluatedByUserId: evaluatorUserId,
        lastEvaluatedAt: now,
        responsibleContact: input.responsibleContact ?? null,
        recommendation: input.recommendation ?? null,
        requiredActions: input.requiredActions ?? null,
        internalNotes: input.internalNotes ?? null,
      },
    }),
    prisma.readinessCategoryScore.deleteMany({ where: { assessmentId } }),
    prisma.readinessCategoryScore.createMany({
      data: input.categoryScores.map((score) => ({
        assessmentId,
        categoryId: score.categoryId,
        score: score.score ?? null,
        status: score.status,
        recommendation: score.recommendation ?? null,
        requiredActions: score.requiredActions ?? null,
        internalNote: score.internalNote ?? null,
        evaluatedByUserId: evaluatorUserId,
        evaluatedAt: now,
      })),
    }),
  ]);

  return { ok: true, assessmentId };
}
