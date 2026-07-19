/** Mirrors NestJS readiness DTO limits. */
export const READINESS_SCORE_MIN = 0;
export const READINESS_SCORE_MAX = 100;
export const READINESS_TITLE_MAX_LENGTH = 200;
export const READINESS_DESCRIPTION_MAX_LENGTH = 4000;
export const READINESS_NOTE_BODY_MAX_LENGTH = 8000;
export const READINESS_RECOMMENDATION_SUMMARY_MAX_LENGTH = 2000;
export const READINESS_CATEGORY_NAME_MAX_LENGTH = 120;
export const READINESS_CATEGORY_WEIGHT_MIN = 1;
export const READINESS_CATEGORY_WEIGHT_MAX = 100;

export const READINESS_DEFAULT_PAGE_SIZE = 20;
export const READINESS_MAX_PAGE_SIZE = 50;

export const READINESS_SCORE_STATUSES = [
  "not_started",
  "needs_improvement",
  "in_progress",
  "ready",
  "blocked",
] as const;

export const READINESS_TARGET_TYPES = [
  "builder_company",
  "project",
] as const;

export const READINESS_VISIBILITY_OPTIONS = [
  "builder_visible",
  "internal_only",
] as const;

export const READINESS_REQUIRED_ACTION_STATUSES = [
  "open",
  "in_progress",
  "done",
  "blocked",
  "cancelled",
] as const;
