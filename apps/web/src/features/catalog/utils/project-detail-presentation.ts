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

const TIMELINE_STAGE_SET = new Set<string>(TIMELINE_STAGE_KEYS);

/**
 * Parses a timeline stage key from amenities JSON (or any unknown value).
 */
export const parseTimelineStageKey = (value: unknown): TimelineStageKey | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!TIMELINE_STAGE_SET.has(trimmed)) {
    return null;
  }
  return trimmed as TimelineStageKey;
};

/**
 * Reads per-stage dates from `Project.amenities.timelineStageDates`.
 */
export const readAmenitiesTimelineStageDates = (
  amenities: unknown,
): Partial<Record<TimelineStageKey, string>> => {
  if (amenities == null || typeof amenities !== 'object' || Array.isArray(amenities)) {
    return {};
  }
  const raw = (amenities as Record<string, unknown>)['timelineStageDates'];
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }
  const record = raw as Record<string, unknown>;
  const dates: Partial<Record<TimelineStageKey, string>> = {};
  for (const key of TIMELINE_STAGE_KEYS) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      dates[key] = value.trim();
    }
  }
  return dates;
};

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
 * Formats a catalog date (`YYYY-MM-DD`, `MM/YYYY`, or day-first) for timeline display.
 */
export const formatTimelineStageDate = (value: string | null | undefined): string | null => {
  if (value == null || value.trim().length === 0) {
    return null;
  }
  const trimmed = value.trim();
  const monthYear = /^(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (monthYear) {
    const month = Number(monthYear[1]);
    const year = Number(monthYear[2]);
    if (month >= 1 && month <= 12) {
      return `${String(month).padStart(2, '0')}/${year}`;
    }
  }
  return formatCompletionQuarter(trimmed) ?? trimmed;
};

const resolveTimelineIndexFromSoldPercent = (soldPercent: number): number => {
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
 * Resolves which timeline stage is current from sold share (0–4).
 */
export const resolveActiveTimelineIndex = (project: ProjectDetail): number => {
  return resolveTimelineIndexFromSoldPercent(computeSoldPercent(project));
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
