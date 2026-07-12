import { describe, expect, it } from 'vitest';

import { adminReportNameSchema } from './constants';

describe('adminReportNameSchema', () => {
  it('accepts known report names', () => {
    expect(adminReportNameSchema.parse('deals')).toBe('deals');
    expect(adminReportNameSchema.parse('checkins')).toBe('checkins');
    expect(adminReportNameSchema.parse('project-views')).toBe('project-views');
    expect(adminReportNameSchema.parse('audit')).toBe('audit');
  });

  it('rejects unknown names', () => {
    expect(adminReportNameSchema.safeParse('secrets').success).toBe(false);
  });
});
