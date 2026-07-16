import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findMany } = vi.hoisted(() => ({
  findMany: vi.fn(),
}));

vi.mock('@toonexpo/db', () => ({
  prisma: {
    readinessAssessment: {
      findMany,
    },
    partner: {
      findMany: vi.fn(),
    },
  },
}));

import { assertBuilderAssessmentPublicFields, listBuilderAssessments } from './builder-queries';

describe('listBuilderAssessments visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps query rows without internalNotes or internalNote', async () => {
    findMany.mockResolvedValue([
      {
        id: 'a1',
        targetType: 'BUILDER_COMPANY',
        companyId: 'company-1',
        projectId: null,
        status: 'NEEDS_IMPROVEMENT',
        overallScore: 55,
        recommendation: 'Improve media',
        requiredActions: 'Upload renders',
        responsibleContact: 'Desk',
        lastEvaluatedAt: new Date('2026-07-01T00:00:00.000Z'),
        updatedAt: new Date('2026-07-01T00:00:00.000Z'),
        project: null,
        categoryScores: [
          {
            categoryId: 'c-media',
            score: 28,
            status: 'NEEDS_IMPROVEMENT',
            recommendation: 'Better covers',
            requiredActions: 'Upload cover',
            category: {
              key: 'media_materials',
              name: 'Media materials',
              serviceCategoryKey: 'render_studio',
            },
          },
        ],
      },
    ]);

    const result = await listBuilderAssessments('company-1');

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { companyId: 'company-1', archivedAt: null },
        select: expect.not.objectContaining({
          internalNotes: true,
        }),
      }),
    );

    const assessment = result[0];
    expect(assessment).toBeDefined();
    expect(assessment).not.toHaveProperty('internalNotes');
    expect(assessment?.categoryScores[0]).not.toHaveProperty('internalNote');
  });

  it('returns empty for a company with no assessments (foreign company)', async () => {
    findMany.mockResolvedValue([]);

    await expect(listBuilderAssessments('other-company')).resolves.toEqual([]);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { companyId: 'other-company', archivedAt: null },
      }),
    );
  });
});

describe('assertBuilderAssessmentPublicFields', () => {
  it('strips internal fields from mock rows that include them', () => {
    const publicAssessment = assertBuilderAssessmentPublicFields({
      id: 'a1',
      targetType: 'BUILDER_COMPANY',
      companyId: 'company-1',
      projectId: null,
      projectName: null,
      status: 'NEEDS_IMPROVEMENT',
      overallScore: 40,
      recommendation: 'Improve media',
      requiredActions: 'Upload',
      responsibleContact: null,
      lastEvaluatedAt: null,
      updatedAt: new Date(),
      internalNotes: 'SECRET admin note',
      categoryScores: [
        {
          categoryId: 'c1',
          categoryKey: 'media_materials',
          categoryName: 'Media',
          serviceCategoryKey: 'render_studio',
          score: 20,
          status: 'NEEDS_IMPROVEMENT',
          recommendation: 'Fix media',
          requiredActions: null,
          internalNote: 'SECRET category note',
        },
      ],
    });

    expect(publicAssessment).not.toHaveProperty('internalNotes');
    expect(publicAssessment.categoryScores[0]).not.toHaveProperty('internalNote');
  });
});
