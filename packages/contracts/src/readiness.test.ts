import { describe, expect, it } from 'vitest';

import {
  READINESS_SCORE_MAX,
  assessmentUpsertInputSchema,
  builderReadinessAssessmentSchema,
} from './readiness';

describe('assessmentUpsertInputSchema', () => {
  it('requires companyId for BUILDER_COMPANY and forbids projectId', () => {
    const missingCompany = assessmentUpsertInputSchema.safeParse({
      targetType: 'BUILDER_COMPANY',
      status: 'IN_PROGRESS',
      categoryScores: [{ categoryId: 'c1', status: 'NOT_STARTED' }],
    });
    expect(missingCompany.success).toBe(false);

    const withProject = assessmentUpsertInputSchema.safeParse({
      targetType: 'BUILDER_COMPANY',
      companyId: 'company-1',
      projectId: 'project-1',
      status: 'IN_PROGRESS',
      categoryScores: [{ categoryId: 'c1', status: 'NOT_STARTED' }],
    });
    expect(withProject.success).toBe(false);
  });

  it('accepts a valid company assessment payload', () => {
    const result = assessmentUpsertInputSchema.safeParse({
      targetType: 'BUILDER_COMPANY',
      companyId: 'company-1',
      status: 'NEEDS_IMPROVEMENT',
      internalNotes: 'Admin only',
      categoryScores: [
        {
          categoryId: 'c1',
          score: 28,
          status: 'NEEDS_IMPROVEMENT',
          recommendation: 'Improve media',
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects scores above max', () => {
    const result = assessmentUpsertInputSchema.safeParse({
      targetType: 'PROJECT',
      projectId: 'project-1',
      status: 'READY',
      categoryScores: [
        {
          categoryId: 'c1',
          score: READINESS_SCORE_MAX + 1,
          status: 'READY',
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe('builderReadinessAssessmentSchema', () => {
  it('does not allow internalNotes on the builder DTO shape', () => {
    const result = builderReadinessAssessmentSchema.safeParse({
      id: 'a1',
      targetType: 'BUILDER_COMPANY',
      companyId: 'c1',
      projectId: null,
      projectName: null,
      status: 'READY',
      overallScore: 80,
      recommendation: null,
      requiredActions: null,
      responsibleContact: null,
      lastEvaluatedAt: null,
      updatedAt: new Date(),
      internalNotes: 'leak',
      categoryScores: [],
    });

    // Zod object strips unknown keys by default — ensure parse succeeds without
    // the field remaining on the typed output.
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('internalNotes');
    }
  });
});
