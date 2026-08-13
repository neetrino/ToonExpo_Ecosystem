import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ReadinessAssessmentTargetType,
  ReadinessScoreStatus,
  ReadinessVisibility,
} from '@toonexpo/db';

import type { PrismaService } from '../../prisma/prisma.service.js';
import { PortalReadinessService } from './portal-readiness.service.js';

describe('PortalReadinessService helpAvailable', () => {
  const readinessAssessmentFindFirst = vi.fn();
  const readinessAssessmentFindMany = vi.fn();
  const readinessCriterionFindMany = vi.fn();
  const projectFindMany = vi.fn();
  const serviceProviderCategoryLinkGroupBy = vi.fn();
  let service: PortalReadinessService;

  const member = {
    companyId: 'co_1',
    userId: 'user_1',
    role: 'company_admin' as const,
    companyType: 'builder' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    const prisma = {
      db: {
        readinessAssessment: {
          findFirst: readinessAssessmentFindFirst,
          findMany: readinessAssessmentFindMany,
        },
        readinessCriterion: { findMany: readinessCriterionFindMany },
        project: { findMany: projectFindMany },
        serviceProviderCategoryLink: { groupBy: serviceProviderCategoryLinkGroupBy },
      },
    } as unknown as PrismaService;

    service = new PortalReadinessService(prisma);
    projectFindMany.mockResolvedValue([]);
    readinessAssessmentFindMany.mockResolvedValue([]);
    readinessCriterionFindMany.mockResolvedValue([]);
    serviceProviderCategoryLinkGroupBy.mockResolvedValue([
      {
        serviceProviderCategoryId: 'sp_cat_1',
        _count: { serviceProviderId: 2 },
      },
    ]);
  });

  it('sets helpAvailable when linked category has active providers', async () => {
    readinessAssessmentFindFirst.mockResolvedValue({
      id: 'asm_1',
      targetType: ReadinessAssessmentTargetType.builder_company,
      builderCompanyId: 'co_1',
      projectId: null,
      status: ReadinessScoreStatus.needs_improvement,
      overallScore: 40,
      lastEvaluatedAt: new Date('2026-07-18T10:00:00.000Z'),
      project: null,
      scores: [
        {
          categoryId: 'readiness_cat_1',
          score: 40,
          status: ReadinessScoreStatus.needs_improvement,
          recommendationSummary: 'Improve legal docs',
          category: {
            code: 'product',
            name: 'Legal readiness',
            weight: 40,
            serviceProviderCategoryId: 'sp_cat_1',
          },
        },
        {
          categoryId: 'readiness_cat_2',
          score: 80,
          status: ReadinessScoreStatus.ready,
          recommendationSummary: null,
          category: {
            code: 'packaging',
            name: 'Media',
            weight: 30,
            serviceProviderCategoryId: null,
          },
        },
      ],
      criterionScores: [],
      recommendations: [],
      requiredActions: [],
    });

    const result = await service.getCompanyReadiness(member);
    const scores = result.data[0]?.scores ?? [];

    expect(scores[0]?.serviceProviderCategoryId).toBe('sp_cat_1');
    expect(scores[0]?.helpAvailable).toBe(true);
    expect(scores[1]?.helpAvailable).toBe(false);
  });

  it('sets helpAvailable on a criterion linked to a provider category', async () => {
    readinessCriterionFindMany.mockResolvedValue([
      {
        id: 'crit_1',
        code: 'price_orientation',
        categoryId: 'readiness_cat_1',
        parentId: null,
        maxPoints: 10,
        sortOrder: 1,
        serviceProviderCategoryId: 'sp_cat_1',
        active: true,
      },
    ]);
    readinessAssessmentFindFirst.mockResolvedValue({
      id: 'asm_1',
      targetType: ReadinessAssessmentTargetType.builder_company,
      builderCompanyId: 'co_1',
      projectId: null,
      status: ReadinessScoreStatus.needs_improvement,
      overallScore: 40,
      lastEvaluatedAt: new Date('2026-07-18T10:00:00.000Z'),
      project: null,
      scores: [
        {
          categoryId: 'readiness_cat_1',
          score: 40,
          status: ReadinessScoreStatus.needs_improvement,
          recommendationSummary: null,
          category: {
            code: 'product',
            name: 'Product',
            weight: 40,
            serviceProviderCategoryId: null,
          },
        },
      ],
      criterionScores: [],
      recommendations: [],
      requiredActions: [],
    });

    const result = await service.getCompanyReadiness(member);
    const criterion = result.data[0]?.scores[0]?.criteria[0];

    expect(criterion?.serviceProviderCategoryId).toBe('sp_cat_1');
    expect(criterion?.helpAvailable).toBe(true);
  });

  it('queries portal include with builder_visible filters only', async () => {
    readinessAssessmentFindFirst.mockResolvedValue(null);

    await service.getCompanyReadiness(member);

    expect(readinessAssessmentFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          recommendations: expect.objectContaining({
            where: { visibility: ReadinessVisibility.builder_visible },
          }),
          requiredActions: expect.objectContaining({
            where: { visibility: ReadinessVisibility.builder_visible },
          }),
        }),
      }),
    );
  });
});
