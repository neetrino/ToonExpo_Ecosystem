/** Shared types for the `GeoMapCanvas` core and its consumers (Stage 2b, Stage 3). */

/** A geographic point in `[longitude, latitude]` order (MapLibre/deck.gl convention). */
export type GeoMapLngLat = {
  longitude: number;
  latitude: number;
};

/**
 * Normalized, numeric view-model for a single 3D map object (one project's
 * placed model). Built from the API contracts (`AdminGeoMapModelItem` /
 * `PublicGeoMapModelItem`, both Decimal-as-string) via the mappers in
 * `utils/map-object-mapper.ts` — this is the only shape `GeoMapCanvas` renders.
 */
export type GeoMapObject = {
  /** Stable id used for click/hover/drag callbacks (`ProjectMapModel.id`, or `projectId` for public payloads). */
  id: string;
  projectId: string;
  /** Marker label shown below `minZoom`. */
  label: string;
  /** GLB url (R2), rendered via deck.gl `ScenegraphLayer` at/above `minZoom`. */
  modelUrl: string;
  longitude: number;
  latitude: number;
  altitudeM: number;
  headingDeg: number;
  pitchDeg: number;
  rollDeg: number;
  scale: number;
  /** Map zoom at which the model replaces the marker. */
  minZoom: number;
};

/**
 * Imperative camera focus request for `GeoMapCanvas`.
 * Bump `token` (nonce) to re-trigger `flyTo` for the same `objectId`.
 */
export type GeoMapFocusRequest = {
  objectId: string;
  /** Optional absolute zoom; defaults to `object.minZoom + FOCUS_ZOOM_ABOVE_MIN`. */
  zoom?: number;
  token: number;
};

/** Props for `GeoMapCanvas`. Designed for reuse by the admin editor (Stage 2b) and the public map (Stage 3). */
export type GeoMapCanvasProps = {
  /** Objects to render — markers below `minZoom`, GLB models at/above `minZoom`. */
  objects: GeoMapObject[];
  /** MapLibre style URL; defaults to `DEFAULT_MAP_STYLE_URL` (override via `NEXT_PUBLIC_MAP_STYLE_URL`). */
  styleUrl?: string;
  /** Initial camera center; defaults to `DEFAULT_MAP_CENTER_*` (Yerevan). */
  initialCenter?: GeoMapLngLat;
  /** Initial camera zoom; defaults to `DEFAULT_MAP_ZOOM`. */
  initialZoom?: number;
  /**
   * Enables drag-to-move for markers and models and reports the result via
   * `onObjectDragged`. Read-only consumers (public map) must omit this or pass `false`.
   */
  editable?: boolean;
  /** Extra class names for the map container; the caller controls sizing (e.g. `h-[600px]`). */
  className?: string;
  /**
   * When set (and `token` changes), smoothly flies the camera to that object's
   * lng/lat. Backward-compatible — omit for read-only / uncontrolled consumers.
   */
  focusRequest?: GeoMapFocusRequest | undefined;
  /** Optional visual highlight for a marker (cheap ring). Omit when unused. */
  highlightedObjectId?: string | null | undefined;
  /** Fired when a marker or model is clicked. */
  onObjectClick?: ((id: string) => void) | undefined;
  /** Fired on hover start (`id`) and hover end (`null`) over a marker or model. */
  onObjectHover?: ((id: string | null) => void) | undefined;
  /** Fired when the base map is clicked on empty space (not on a marker/model). */
  onMapClick?: ((position: GeoMapLngLat) => void) | undefined;
  /** Fired once an `editable` drag ends, with the object's new position. */
  onObjectDragged?: ((id: string, position: GeoMapLngLat) => void) | undefined;
};
