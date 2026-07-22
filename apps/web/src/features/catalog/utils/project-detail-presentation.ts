import type { ProjectDetail } from '@toonexpo/contracts';

import { computeSoldPercent } from '@/features/catalog/utils/development-progress';

export type TimelineStageStatus = 'complete' | 'inProgress' | 'upcoming';

export type TimelineStageKey = 'preSale' | 'foundation' | 'structure' | 'facade' | 'handover';

export const TIMELINE_STAGE_KEYS: TimelineStageKey[] = [
  'preSale',
  'foundation',
  'structure',
  'facade',
  'handover',
];

/**
 * Formats a completion date as a quarter label (e.g. Q3 2026).
 */
export const formatCompletionQuarter = (isoDate: string | null | undefined): string | null => {
  if (isoDate == null || isoDate.length < 7) {
    return null;
  }
  const year = Number(isoDate.slice(0, 4));
  const month = Number(isoDate.slice(5, 7));
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return null;
  }
  const quarter = Math.floor((month - 1) / 3) + 1;
  return `Q${quarter} ${year}`;
};

/**
 * Resolves which timeline stage is current from sold share (0–4).
 */
export const resolveActiveTimelineIndex = (project: ProjectDetail): number => {
  const soldPercent = computeSoldPercent(project);
  if (soldPercent < 15) {
    return 0;
  }
  if (soldPercent < 35) {
    return 1;
  }
  if (soldPercent < 55) {
    return 2;
  }
  if (soldPercent < 85) {
    return 3;
  }
  return 4;
};

/**
 * Maps stage index relative to the active stage into a visual status.
 */
export const timelineStageStatus = (
  stageIndex: number,
  activeIndex: number,
): TimelineStageStatus => {
  if (stageIndex < activeIndex) {
    return 'complete';
  }
  if (stageIndex === activeIndex) {
    return 'inProgress';
  }
  return 'upcoming';
};
