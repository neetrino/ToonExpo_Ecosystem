import type { GreenLngLat } from '@/features/geo-map/trees/types';
import type { RoadLine } from '@/features/geo-map/traffic/types';

const MIN_LINE_POINTS = 2;

const asPosition = (value: unknown): GreenLngLat | null => {
  if (!Array.isArray(value) || value.length < 2) {
    return null;
  }
  const longitude = Number(value[0]);
  const latitude = Number(value[1]);
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    return null;
  }
  return { longitude, latitude };
};

const lineFromCoords = (coords: unknown): RoadLine | null => {
  if (!Array.isArray(coords) || coords.length < MIN_LINE_POINTS) {
    return null;
  }
  const line: GreenLngLat[] = [];
  for (const pair of coords) {
    const position = asPosition(pair);
    if (!position) {
      return null;
    }
    line.push(position);
  }
  return line;
};

/** Read LineString / MultiLineString road geometry from vector tiles. */
export const linesFromGeometry = (geometry: {
  type?: string;
  coordinates?: unknown;
}): RoadLine[] => {
  if (geometry.type === 'LineString') {
    const line = lineFromCoords(geometry.coordinates);
    return line ? [line] : [];
  }
  if (geometry.type !== 'MultiLineString' || !Array.isArray(geometry.coordinates)) {
    return [];
  }
  const lines: RoadLine[] = [];
  for (const coords of geometry.coordinates) {
    const line = lineFromCoords(coords);
    if (line) {
      lines.push(line);
    }
  }
  return lines;
};
