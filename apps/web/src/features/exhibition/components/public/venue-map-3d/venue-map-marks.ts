export type VenueMarkKind = 'zone' | 'pill' | 'poi';

export type VenueMark = {
  text: string;
  kind: VenueMarkKind;
  /** PDF points, same axes as the hall shell. */
  x: number;
  z: number;
  /** Height in metres. */
  y: number;
  /** Hidden until the camera is closer than this. Null stays visible. */
  maxDist: number | null;
  zoom: boolean;
};

const MARK_ZOOM_NEAR = 420;
const MARK_SCALE_MIN = 0.6;
const MARK_SCALE_MAX = 1.6;

/** Fixed hall labels from the BOS floor plan. */
export const VENUE_MARKS: readonly VenueMark[] = [
  { text: 'Special zone', kind: 'zone', x: 780, z: 1310, y: 0.5, maxDist: null, zoom: true },
  { text: 'Smoking zone', kind: 'zone', x: 1004, z: 725, y: 0.3, maxDist: null, zoom: true },
  { text: 'Chill zone', kind: 'zone', x: 2098, z: 1284, y: 0.5, maxDist: null, zoom: true },
  { text: 'Food zone', kind: 'zone', x: 2800, z: 1440, y: 0.3, maxDist: null, zoom: true },
  { text: 'P', kind: 'poi', x: 1423, z: 478, y: 0.2, maxDist: null, zoom: false },
  { text: 'P', kind: 'poi', x: 3294, z: 1449, y: 0.2, maxDist: null, zoom: false },
  { text: 'Stage', kind: 'pill', x: 402, z: 1307, y: 1.1, maxDist: 120, zoom: false },
  { text: 'WC', kind: 'pill', x: 752, z: 721, y: 1.3, maxDist: 150, zoom: false },
  { text: 'WC', kind: 'pill', x: 1272, z: 1178, y: 1.3, maxDist: 150, zoom: false },
  { text: 'WC', kind: 'pill', x: 1637, z: 1181, y: 1.3, maxDist: 150, zoom: false },
  { text: 'Entrance', kind: 'pill', x: 2420, z: 882, y: 0.3, maxDist: null, zoom: false },
  { text: 'Entrance', kind: 'pill', x: 2420, z: 1088, y: 0.3, maxDist: null, zoom: false },
  { text: 'Entrance', kind: 'pill', x: 2420, z: 1560, y: 0.3, maxDist: null, zoom: false },
  { text: 'Registration', kind: 'pill', x: 2330, z: 1010, y: 1.3, maxDist: 200, zoom: false },
  { text: 'Registration', kind: 'pill', x: 816, z: 763, y: 1.3, maxDist: 150, zoom: false },
  { text: 'Info point', kind: 'pill', x: 804, z: 876, y: 0.5, maxDist: 120, zoom: false },
  { text: 'Info point', kind: 'pill', x: 263, z: 946, y: 0.5, maxDist: 120, zoom: false },
  { text: 'Info point', kind: 'pill', x: 2275, z: 956, y: 0.5, maxDist: 120, zoom: false },
  { text: 'Info point', kind: 'pill', x: 1942, z: 1086, y: 0.5, maxDist: 120, zoom: false },
  { text: 'Info point', kind: 'pill', x: 1253, z: 1300, y: 0.5, maxDist: 120, zoom: false },
  { text: 'Exit', kind: 'pill', x: 1678, z: 782, y: 1.3, maxDist: 150, zoom: false },
  { text: 'Exit', kind: 'pill', x: 1858, z: 782, y: 1.3, maxDist: 150, zoom: false },
  { text: 'Exit', kind: 'pill', x: 2037, z: 782, y: 1.3, maxDist: 150, zoom: false },
  { text: 'Exit', kind: 'pill', x: 2277, z: 782, y: 1.3, maxDist: 150, zoom: false },
  { text: 'Security', kind: 'pill', x: 3212, z: 1150, y: 2.4, maxDist: 200, zoom: false },
  { text: 'Stairs', kind: 'pill', x: 195, z: 1290, y: 2.2, maxDist: 150, zoom: false },
];

export const venueMarkVisible = (mark: VenueMark, distance: number): boolean =>
  mark.maxDist === null || distance < mark.maxDist;

export const venueMarkScale = (mark: VenueMark, distance: number): number => {
  if (!mark.zoom) return 1;
  const scale = MARK_ZOOM_NEAR / Math.max(distance, 1);
  return Math.min(MARK_SCALE_MAX, Math.max(MARK_SCALE_MIN, scale));
};
