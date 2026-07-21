import { describe, expect, it } from 'vitest';

import {
  resolveAnalyticsDateRange,
  resolveAnalyticsDateRangeFromPreset,
} from '@/features/analytics/utils/resolve-analytics-date-range';

describe('resolveAnalyticsDateRangeFromPreset', () => {
  const now = new Date('2026-07-18T15:30:00.000Z');

  it('uses start of local day for today preset', () => {
    const range = resolveAnalyticsDateRangeFromPreset('today', now);
    const from = new Date(range.from);

    expect(from.getHours()).toBe(0);
    expect(from.getMinutes()).toBe(0);
    expect(range.to).toBe(now.toISOString());
  });

  it('uses a 7-day lookback for last7Days preset', () => {
    const range = resolveAnalyticsDateRangeFromPreset('last7Days', now);
    const from = new Date(range.from);
    const diffDays = (now.getTime() - from.getTime()) / (24 * 60 * 60 * 1000);

    expect(diffDays).toBeCloseTo(7, 5);
  });

  it('floors default now to the local minute for stable query keys', () => {
    const first = resolveAnalyticsDateRangeFromPreset('last30Days');
    const second = resolveAnalyticsDateRangeFromPreset('last30Days');

    expect(first.from).toBe(second.from);
    expect(first.to).toBe(second.to);
    expect(new Date(first.to).getSeconds()).toBe(0);
    expect(new Date(first.to).getMilliseconds()).toBe(0);
  });
});

describe('resolveAnalyticsDateRange', () => {
  it('defaults to last 30 days when preset is missing', () => {
    const now = new Date('2026-07-18T12:00:00.000Z');
    const range = resolveAnalyticsDateRange(null, now);

    expect(range.preset).toBe('last30Days');
    expect(new Date(range.to).toISOString()).toBe(now.toISOString());
  });
});
