/** Drop the closing duplicate of a GeoJSON ring. */
export const openBuildingRing = (ring: readonly (readonly number[])[]): number[][] => {
  if (ring.length < 2) {
    return [];
  }
  const first = ring[0];
  const last = ring[ring.length - 1];
  const closed = Boolean(first && last && first[0] === last[0] && first[1] === last[1]);
  const open = closed ? ring.slice(0, -1) : ring;
  return open.map((point) => [point[0] ?? 0, point[1] ?? 0]);
};

export const closeBuildingRing = (open: readonly (readonly number[])[]): number[][] => {
  const first = open[0];
  if (!first) {
    return [];
  }
  return [...open.map((point) => [point[0] ?? 0, point[1] ?? 0]), [first[0] ?? 0, first[1] ?? 0]];
};
