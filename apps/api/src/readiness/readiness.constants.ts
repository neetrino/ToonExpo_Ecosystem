/** Default category weight when none is configured. */
export const READINESS_DEFAULT_CATEGORY_WEIGHT = 1;

/** Minimum valid category score (inclusive). */
export const READINESS_SCORE_MIN = 0;

/** Maximum valid category score (inclusive). */
export const READINESS_SCORE_MAX = 100;

/** Scores at or below this value map to `needs_improvement`. */
export const READINESS_NEEDS_IMPROVEMENT_MAX = 39;

/** Scores from this value through `READINESS_IN_PROGRESS_MAX` map to `in_progress`. */
export const READINESS_IN_PROGRESS_MIN = 40;

/** Scores at or below this value (when ≥ in-progress min) map to `in_progress`. */
export const READINESS_IN_PROGRESS_MAX = 69;

/** Scores from this value through max map to `ready`. */
export const READINESS_READY_MIN = 70;

export const READINESS_MIN_PAGE = 1;

export const READINESS_DEFAULT_PAGE_SIZE = 20;

export const READINESS_MAX_PAGE_SIZE = 50;

export const READINESS_TITLE_MAX_LENGTH = 200;

export const READINESS_DESCRIPTION_MAX_LENGTH = 4000;

export const READINESS_NOTE_BODY_MAX_LENGTH = 8000;

export const READINESS_RECOMMENDATION_SUMMARY_MAX_LENGTH = 2000;

export const READINESS_ENTITY_TYPE_MAX_LENGTH = 64;

export const READINESS_ENTITY_ID_MAX_LENGTH = 64;

export const READINESS_CATEGORY_NAME_MAX_LENGTH = 120;

export const READINESS_CATEGORY_WEIGHT_MIN = 1;

export const READINESS_CATEGORY_WEIGHT_MAX = 100;
