import type { AssessmentUpsertInput } from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';
import type { ReadinessStatus } from '@toonexpo/domain';

import { type AuditActor, formatStatusTransition, recordAudit } from '@/lib/audit/record-audit';
import { computeOverallScore } from '@/lib/readiness/score';

import { loadActiveReadinessCategories, type ReadinessCategoryOption } from './readiness-queries';
import { type AdminMutationResult } from './mutation-result';

type ResolvedTarget = {
  companyId: string;
  projectId: string | null;
};

type AssessmentSnapshot = {
  id: string;
  status: ReadinessStatus;
  overallScore: number | null;
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

function formatReadinessAuditDetail(
  fromStatus: string | null,
  toStatus: string,
  fromScore: number | null,
  toScore: number | null,
): string {
  const parts: string[] = [];
  if (fromStatus === null) {
    parts.push(`create:${toStatus}`);
  } else if (fromStatus !== toStatus) {
    parts.push(formatStatusTransition(fromStatus, toStatus));
  }
  if (fromScore !== toScore) {
    parts.push(`score:${fromScore ?? 'null'}→${toScore ?? 'null'}`);
  }
  return parts.join('; ');
}

function assessmentWriteData(
  input: AssessmentUpsertInput,
  target: ResolvedTarget,
  actor: AuditActor,
  overallScore: number | null,
  now: Date,
) {
  return {
    targetType: input.targetType,
    companyId: target.companyId,
    projectId: target.projectId,
    status: input.status,
    overallScore,
    evaluatedByUserId: actor.userId,
    lastEvaluatedAt: now,
    responsibleContact: input.responsibleContact ?? null,
    recommendation: input.recommendation ?? null,
    requiredActions: input.requiredActions ?? null,
    internalNotes: input.internalNotes ?? null,
  };
}

function categoryScoreRows(
  assessmentId: string,
  input: AssessmentUpsertInput,
  actor: AuditActor,
  now: Date,
) {
  return input.categoryScores.map((score) => ({
    assessmentId,
    categoryId: score.categoryId,
    score: score.score ?? null,
    status: score.status,
    recommendation: score.recommendation ?? null,
    requiredActions: score.requiredActions ?? null,
    internalNote: score.internalNote ?? null,
    evaluatedByUserId: actor.userId,
    evaluatedAt: now,
  }));
}

export async function upsertAssessment(
  input: AssessmentUpsertInput,
  actor: AuditActor,
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
    return updateExistingAssessment(input, target, actor, overallScore, now);
  }

  return createAssessment(input, target, actor, overallScore, now);
}

async function createAssessment(
  input: AssessmentUpsertInput,
  target: ResolvedTarget,
  actor: AuditActor,
  overallScore: number | null,
  now: Date,
): Promise<AdminMutationResult<{ assessmentId: string }>> {
  return prisma.$transaction(async (tx) => {
    const created = await tx.readinessAssessment.create({
      data: {
        ...assessmentWriteData(input, target, actor, overallScore, now),
        categoryScores: {
          create: input.categoryScores.map((score) => ({
            categoryId: score.categoryId,
            score: score.score ?? null,
            status: score.status,
            recommendation: score.recommendation ?? null,
            requiredActions: score.requiredActions ?? null,
            internalNote: score.internalNote ?? null,
            evaluatedByUserId: actor.userId,
            evaluatedAt: now,
          })),
        },
      },
      select: { id: true },
    });

    await recordAudit(tx, {
      actor,
      action: 'READINESS_ASSESSMENT_UPSERT',
      entityType: 'READINESS_ASSESSMENT',
      entityId: created.id,
      companyId: target.companyId,
      detail: formatReadinessAuditDetail(null, input.status, null, overallScore),
    });

    return { ok: true, assessmentId: created.id };
  });
}

async function maybeAuditAssessmentChange(
  tx: Parameters<typeof recordAudit>[0],
  existing: AssessmentSnapshot,
  input: AssessmentUpsertInput,
  target: ResolvedTarget,
  actor: AuditActor,
  overallScore: number | null,
): Promise<void> {
  const statusChanged = existing.status !== input.status;
  const scoreChanged = existing.overallScore !== overallScore;
  if (!statusChanged && !scoreChanged) {
    return;
  }

  await recordAudit(tx, {
    actor,
    action: 'READINESS_ASSESSMENT_UPSERT',
    entityType: 'READINESS_ASSESSMENT',
    entityId: existing.id,
    companyId: target.companyId,
    detail: formatReadinessAuditDetail(
      existing.status,
      input.status,
      existing.overallScore,
      overallScore,
    ),
  });
}

async function updateExistingAssessment(
  input: AssessmentUpsertInput,
  target: ResolvedTarget,
  actor: AuditActor,
  overallScore: number | null,
  now: Date,
): Promise<AdminMutationResult<{ assessmentId: string }>> {
  const assessmentId = input.assessmentId as string;

  return prisma.$transaction(async (tx) => {
    const existing = await tx.readinessAssessment.findFirst({
      where: { id: assessmentId, archivedAt: null },
      select: { id: true, status: true, overallScore: true },
    });
    if (!existing) {
      return { ok: false, errorKey: 'notFound' };
    }

    await tx.readinessAssessment.update({
      where: { id: assessmentId },
      data: assessmentWriteData(input, target, actor, overallScore, now),
    });
    await tx.readinessCategoryScore.deleteMany({ where: { assessmentId } });
    await tx.readinessCategoryScore.createMany({
      data: categoryScoreRows(assessmentId, input, actor, now),
    });
    await maybeAuditAssessmentChange(tx, existing, input, target, actor, overallScore);

    return { ok: true, assessmentId };
  });
}
