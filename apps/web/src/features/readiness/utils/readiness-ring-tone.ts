export type ReadinessRingTone =
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'muted'
  | 'accent'
  | 'info'
  | 'cyan'
  | 'orange'
  | 'violet'
  | 'green';

export const OVERALL_RING_TONE: ReadinessRingTone = 'cyan';

const CATEGORY_TONE: Record<string, ReadinessRingTone> = {
  product: 'orange',
  packaging: 'violet',
  team: 'green',
};

const FALLBACK_TONES: readonly ReadinessRingTone[] = ['cyan', 'orange', 'violet', 'green'];

export const RING_STROKE_CLASS: Record<ReadinessRingTone, string> = {
  brand: 'stroke-brand',
  success: 'stroke-success',
  warning: 'stroke-warning',
  danger: 'stroke-danger',
  muted: 'stroke-ink-muted',
  accent: 'stroke-accent',
  info: 'stroke-info',
  cyan: 'stroke-kpi-cyan',
  orange: 'stroke-kpi-orange',
  violet: 'stroke-kpi-violet',
  green: 'stroke-kpi-green',
};

export const RING_TEXT_CLASS: Record<ReadinessRingTone, string> = {
  brand: 'text-brand',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  muted: 'text-ink-muted',
  accent: 'text-accent',
  info: 'text-info',
  cyan: 'text-kpi-cyan',
  orange: 'text-kpi-orange',
  violet: 'text-kpi-violet',
  green: 'text-kpi-green',
};

/**
 * Distinct ring color per KPI category so cards stay colorful on white.
 */
export const toneForCategoryCode = (code: string): ReadinessRingTone => {
  const mapped = CATEGORY_TONE[code];
  if (mapped) {
    return mapped;
  }
  const hash = [...code].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return FALLBACK_TONES[hash % FALLBACK_TONES.length] ?? 'cyan';
};

/**
 * Cycles palette colors for criterion rings in a block.
 */
export const toneAtIndex = (index: number): ReadinessRingTone =>
  FALLBACK_TONES[index % FALLBACK_TONES.length] ?? 'cyan';
