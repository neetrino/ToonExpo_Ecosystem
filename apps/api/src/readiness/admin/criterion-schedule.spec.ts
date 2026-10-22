import { describe, expect, it } from 'vitest';

import { buildSchedulePatch } from './criterion-schedule.js';

describe('buildSchedulePatch', () => {
  const now = new Date('2026-10-22T09:00:00.000Z');

  it('records completion when a criterion is checked', () => {
    const patch = buildSchedulePatch(
      { checked: false, startedAt: null, completedAt: null },
      { checked: true, dueDate: '2026-10-20', priority: 'high' },
      now,
    );

    expect(patch.data.completedAt).toEqual(now);
    expect(patch.data.dueDate?.toISOString()).toBe('2026-10-20T00:00:00.000Z');
    expect(patch.data.priority).toBe('high');
    expect(patch.event?.toStatus).toBe('done');
    expect(patch.event?.fromStatus).toBe('not_started');
  });

  it('does not write history when the checked state is unchanged', () => {
    const patch = buildSchedulePatch(
      { checked: true, startedAt: now, completedAt: now },
      { checked: true },
      now,
    );

    expect(patch.event).toBeNull();
    expect(patch.data.completedAt).toBeUndefined();
  });
});
