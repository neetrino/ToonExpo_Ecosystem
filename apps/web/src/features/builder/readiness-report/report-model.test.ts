import { describe, expect, it } from 'vitest';

import { BUILDER_READINESS_PREVIEW_ASSESSMENT } from '@/features/builder/constants/builder-readiness-preview';
import { buildReadinessReport } from '@/features/builder/readiness-report/report-model';

describe('buildReadinessReport', () => {
  it('counts finished criteria and keeps deadline buckets at zero', () => {
    const report = buildReadinessReport(BUILDER_READINESS_PREVIEW_ASSESSMENT, {
      title: 'Sunrise',
      categoryLabel: (_code, fallback) => fallback,
      criterionLabel: (code) => code,
    });

    expect(report.total).toBeGreaterThan(0);
    expect(report.done + report.open).toBe(report.total);
    expect(report.overdue).toBe(0);
    expect(report.upcoming).toBe(0);
    expect(report.doneWithoutDeadline).toBe(report.done);
    expect(report.overdue).toBe(0);
    expect(report.completionOrder).toHaveLength(0);
    expect(report.epics.length).toBe(BUILDER_READINESS_PREVIEW_ASSESSMENT.scores.length);
  });
});
