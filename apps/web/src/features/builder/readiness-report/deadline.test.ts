import { describe, expect, it } from 'vitest';

import { deadlineFacts } from '@/features/builder/readiness-report/deadline';

const now = new Date('2026-10-22T08:00:00.000Z');

describe('deadlineFacts', () => {
  it('marks a finished task late when completion is after the deadline day', () => {
    const facts = deadlineFacts(
      { done: true, dueDate: '2026-10-20', completedAt: '2026-10-22T09:00:00.000Z' },
      now,
    );
    expect(facts.outcome).toBe('COMPLETED_LATE');
    expect(facts.lateDays).toBe(2);
  });

  it('marks an open task overdue once the Armenia calendar day has passed', () => {
    const facts = deadlineFacts({ done: false, dueDate: '2026-10-21', completedAt: null }, now);
    expect(facts.outcome).toBe('OVERDUE');
    expect(facts.lateDays).toBe(1);
  });

  it('keeps tasks without a deadline out of the on-time and late buckets', () => {
    expect(
      deadlineFacts({ done: true, dueDate: null, completedAt: '2026-10-22T09:00:00.000Z' }, now)
        .outcome,
    ).toBe('COMPLETED_NO_DEADLINE');
    expect(deadlineFacts({ done: false, dueDate: null, completedAt: null }, now).outcome).toBe(
      'NO_DEADLINE',
    );
  });
});
