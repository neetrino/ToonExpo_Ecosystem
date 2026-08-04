import { isFillableSvgPath } from '@/features/visual-map/utils/is-fillable-svg-path';

export type HotspotLabelPoint = {
  x: number;
  y: number;
};

const MARKER_TO_PERCENT = 100;
const MIN_LABEL_COORD_PAIR_COUNT = 3;

/**
 * Resolves a viewBox pixel label position for a public polygon hotspot.
 * Prefers stored marker percents; falls back to path vertex average.
 */
export const resolvePolygonLabelPoint = (input: {
  svgPath: string;
  xPercent: string | number;
  yPercent: string | number;
  viewBoxWidth: number;
  viewBoxHeight: number;
}): HotspotLabelPoint | null => {
  if (input.viewBoxWidth <= 0 || input.viewBoxHeight <= 0) {
    return null;
  }

  const xPercent = Number(input.xPercent);
  const yPercent = Number(input.yPercent);
  if (
    Number.isFinite(xPercent) &&
    Number.isFinite(yPercent) &&
    (xPercent !== 0 || yPercent !== 0)
  ) {
    return {
      x: (xPercent / MARKER_TO_PERCENT) * input.viewBoxWidth,
      y: (yPercent / MARKER_TO_PERCENT) * input.viewBoxHeight,
    };
  }

  if (!isFillableSvgPath(input.svgPath)) {
    return null;
  }

  const nums = input.svgPath.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
  if (nums.length < MIN_LABEL_COORD_PAIR_COUNT * 2) {
    return null;
  }

  let sumX = 0;
  let sumY = 0;
  let count = 0;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    sumX += nums[i]!;
    sumY += nums[i + 1]!;
    count += 1;
  }
  if (count === 0) {
    return null;
  }

  return { x: sumX / count, y: sumY / count };
};
