'use client';

import type { ReadinessScoreStatus } from '@toonexpo/contracts';

import { READINESS_SCORE_MAX } from '@/features/readiness/constants';

export const scorePercent = (score: number | null): number => {
  if (score === null) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round((score / READINESS_SCORE_MAX) * 100)));
};

export const toneForStatus = (
  status: ReadinessScoreStatus,
): 'brand' | 'success' | 'warning' | 'danger' | 'muted' => {
  if (status === 'ready') {
    return 'success';
  }
  if (status === 'needs_improvement') {
    return 'danger';
  }
  if (status === 'blocked') {
    return 'warning';
  }
  if (status === 'not_started') {
    return 'muted';
  }
  return 'brand';
};
