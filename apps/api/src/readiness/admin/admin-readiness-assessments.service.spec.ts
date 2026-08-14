import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadinessAssessmentTargetType, ReadinessScoreStatus } from '@toonexpo/db';

import type { PrismaService } from '../../prisma/prisma.service.js';
import { AdminReadinessAssessmentsService } from '../admin/admin-readiness-assessments.service.js';
import { ReadinessAssessmentSupportService } from '../admin/readiness-assessment-support.service.js';

describe('AdminReadinessAssessmentsService', () => {
  const transaction = vi.fn();
  const readinessAssessmentFindMany = vi.fn();
  const readinessAssessmentUpdateMany = vi.fn();
  const readinessAssessmentCreate = vi.fn();
  const readinessAssessmentFindUnique = vi.fn();
  const readinessAssessmentUpdate = vi.fn();
  const readinessCategoryFindMany = vi.fn();
  const readinessCriterionFindMany = vi.fn();
  const readinessScoreUpsert = vi.fn();
  const companyFindUnique = vi.fn();
  const projectFindMany = vi.fn();
  const projectFindFirst = vi.fn();

  let service: AdminReadinessAssessmentsService;

  beforeEach(() => {
    vi.clearAllMocks();

    transaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) =>
      callback({
        readinessAssessment: {
          updateMany: readinessAssessmentUpdateMany,
          create: readinessAssessmentCreate,
          update: readinessAssessmentUpdate,
          findUnique: readinessAssessmentFindUnique,
        },
        readinessScore: { upsert: readinessScoreUpsert },
      }),
    );

    const prisma = {
      db: {
        $transaction: transaction,
        readinessAssessment: {
          count: vi.fn(),
          findMany: readinessAssessmentFindMany,
          findUnique: readinessAssessmentFindUnique,
          update: readinessAssessmentUpdate,
        },
        readinessCategory: { findMany: readinessCategoryFindMany, findUnique: vi.fn() },
        readinessCriterion: { findMany: readinessCriterionFindMany },
        readinessScore: { findUnique: vi.fn(), upsert: readinessScoreUpsert },
        company: { findUnique: companyFindUnique },
        project: { findMany: projectFindMany, findFirst: projectFindFirst },
      },
    } as unknown as PrismaService;

    service = new AdminReadinessAssessmentsService(
      prisma,
      new ReadinessAssessmentSupportService(prisma),
      { track: vi.fn() } as never,
    );
  });

  it('archives previous active assessment when creating a new one', async () => {
    companyFindUnique.mockResolvedValue({ id: 'co_1', type: 'builder' });
    readinessCategoryFindMany.mockResolvedValue([{ id: 'cat_1' }, { id: 'cat_2' }]);
    readinessCriterionFindMany.mockResolvedValue([]);
    readinessAssessmentCreate.mockResolvedValue({
      id: 'asm_2',
      targetType: ReadinessAssessmentTargetType.builder_company,
      builderCompanyId: 'co_1',
      projectId: null,
      status: ReadinessScoreStatus.not_started,
      overallScore: null,
      overallScoreOverridden: false,
      evaluatedByUserId: null,
      lastEvaluatedAt: null,
      archivedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      scores: [],
      criterionScores: [],
      recommendations: [],
      requiredActions: [],
      internalNotes: [],
    });

    await service.create({
      targetType: ReadinessAssessmentTargetType.builder_company,
      builderCompanyId: 'co_1',
    });

    expect(readinessAssessmentUpdateMany).toHaveBeenCalledWith({
      where: {
        archivedAt: null,
        targetType: ReadinessAssessmentTargetType.builder_company,
        builderCompanyId: 'co_1',
        projectId: null,
      },
      data: { archivedAt: expect.any(Date) },
    });
  });

  it('sets overallScoreOverridden when admin patches overallScore', async () => {
    readinessAssessmentFindUnique.mockResolvedValue({ id: 'asm_1' });
    readinessCriterionFindMany.mockResolvedValue([]);
    readinessAssessmentUpdate.mockResolvedValue({
      id: 'asm_1',
      targetType: ReadinessAssessmentTargetType.builder_company,
      builderCompanyId: 'co_1',
      projectId: null,
      status: ReadinessScoreStatus.ready,
      overallScore: 88,
      overallScoreOverridden: true,
      evaluatedByUserId: null,
      lastEvaluatedAt: null,
      archivedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      scores: [],
      criterionScores: [],
      recommendations: [],
      requiredActions: [],
      internalNotes: [],
    });

    const result = await service.update('asm_1', { overallScore: 88 });

    expect(readinessAssessmentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          overallScore: 88,
          overallScoreOverridden: true,
        },
      }),
    );
    expect(result.overallScoreOverridden).toBe(true);
  });

  it('returns zero when there are no projects to ensure', async () => {
    projectFindMany.mockResolvedValue([]);

    const result = await service.ensureProjectAssessments();

    expect(result.createdCount).toBe(0);
    expect(readinessAssessmentCreate).not.toHaveBeenCalled();
  });

  it('creates project assessments only for projects without an active one', async () => {
    projectFindMany.mockResolvedValue([
      { id: 'p1', builderCompanyId: 'co_1' },
      { id: 'p2', builderCompanyId: 'co_1' },
    ]);
    readinessAssessmentFindMany.mockResolvedValue([{ projectId: 'p1' }]);
    companyFindUnique.mockResolvedValue({ id: 'co_1', type: 'builder' });
    projectFindFirst.mockResolvedValue({ id: 'p2' });
    readinessCategoryFindMany.mockResolvedValue([]);
    readinessCriterionFindMany.mockResolvedValue([]);
    readinessAssessmentCreate.mockResolvedValue({
      id: 'asm_p2',
      targetType: ReadinessAssessmentTargetType.project,
      builderCompanyId: 'co_1',
      projectId: 'p2',
      status: ReadinessScoreStatus.not_started,
      overallScore: null,
      overallScoreOverridden: false,
      evaluatedByUserId: null,
      lastEvaluatedAt: null,
      archivedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      scores: [],
      criterionScores: [],
      recommendations: [],
      requiredActions: [],
      internalNotes: [],
    });

    const result = await service.ensureProjectAssessments();

    expect(result.createdCount).toBe(1);
    expect(readinessAssessmentCreate).toHaveBeenCalledTimes(1);
    expect(readinessAssessmentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          targetType: ReadinessAssessmentTargetType.project,
          builderCompanyId: 'co_1',
          projectId: 'p2',
        }),
      }),
    );
  });
});
