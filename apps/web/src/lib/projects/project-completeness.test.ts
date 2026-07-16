import { describe, expect, it } from 'vitest';

import { evaluateProjectCompleteness, type ProjectCompletenessInput } from './project-completeness';

const completeProject: ProjectCompletenessInput = {
  description: 'A modern residential complex.',
  hasCoverMedia: true,
  hasCanvas: true,
  buildings: [
    {
      status: 'PUBLISHED',
      floors: [{ status: 'PUBLISHED', apartmentCount: 4 }],
    },
  ],
};

describe('evaluateProjectCompleteness', () => {
  it('returns complete when all checklist items are present', () => {
    expect(evaluateProjectCompleteness(completeProject)).toEqual({
      isComplete: true,
      missingKeys: [],
    });
  });

  it('flags missing cover, description, and canvas', () => {
    const result = evaluateProjectCompleteness({
      ...completeProject,
      description: '   ',
      hasCoverMedia: false,
      hasCanvas: false,
    });

    expect(result.isComplete).toBe(false);
    expect(result.missingKeys).toEqual([
      'MISSING_COVER_MEDIA',
      'MISSING_DESCRIPTION',
      'MISSING_CANVAS',
    ]);
  });

  it('flags missing published building, floor, and apartment', () => {
    const result = evaluateProjectCompleteness({
      ...completeProject,
      buildings: [
        {
          status: 'DRAFT',
          floors: [{ status: 'PUBLISHED', apartmentCount: 2 }],
        },
      ],
    });

    expect(result.missingKeys).toContain('MISSING_PUBLISHED_BUILDING');
    expect(result.missingKeys).toContain('MISSING_PUBLISHED_FLOOR');
    expect(result.missingKeys).toContain('MISSING_APARTMENT');
  });

  it('requires apartments under published floors', () => {
    const result = evaluateProjectCompleteness({
      ...completeProject,
      buildings: [
        {
          status: 'PUBLISHED',
          floors: [{ status: 'PUBLISHED', apartmentCount: 0 }],
        },
      ],
    });

    expect(result.missingKeys).toEqual(['MISSING_APARTMENT']);
  });
});
