/**
 * True when an SVG path has enough geometry for fill hit-testing / hover.
 * Single-point drafts (`M x y`) are not fillable polygons.
 */
export const isFillableSvgPath = (svgPath: string | null | undefined): boolean => {
  if (svgPath == null) {
    return false;
  }
  const trimmed = svgPath.trim();
  if (trimmed.length === 0) {
    return false;
  }

  const nums = trimmed.match(/-?\d+(\.\d+)?/g);
  // Need ≥3 coordinate pairs (6 numbers) for a fillable polygon area.
  return (nums?.length ?? 0) >= 6;
};
