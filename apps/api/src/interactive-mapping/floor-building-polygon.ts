/**
 * True when an SVG path has enough geometry for a fillable polygon (≥3 points).
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
  return (nums?.length ?? 0) >= 6;
};

/**
 * Floor ids that already have a fillable polygon on a building-context canvas.
 */
export const collectFloorsWithBuildingPolygon = (
  canvases: readonly {
    contextType: string;
    hotspots: readonly { targetType: string; targetId: string; svgPath: string | null }[];
  }[],
): Set<string> => {
  const floorIds = new Set<string>();
  for (const canvas of canvases) {
    if (canvas.contextType !== 'building') {
      continue;
    }
    for (const hotspot of canvas.hotspots) {
      if (hotspot.targetType === 'floor' && isFillableSvgPath(hotspot.svgPath)) {
        floorIds.add(hotspot.targetId);
      }
    }
  }
  return floorIds;
};
