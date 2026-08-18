import type { SelectedOsmBuilding } from '@/features/geo-map/utils/building-identification';
import type { OsmBuildingHideTarget } from '@/features/geo-map/utils/build-osm-building-extrusion-filter';
import type { ObjectTransformOverride } from '@/features/geo-map/utils/apply-position-override';

export type { OsmBuildingHideTarget };

/** Shared types for the `GeoMapCanvas` core and its consumers (Stage 2b, Stage 3). */

export type { SelectedOsmBuilding };

/** A geographic point in `[longitude, latitude]` order (MapLibre convention). */
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
  /** Null for admin unassigned placements (not yet attached to a project). */
  projectId: string | null;
  /** Project name — shown in the hover/select info card (not on the dot marker). */
  label: string;
  /** Builder company logo URL for the info card; null when unavailable. */
  logoUrl: string | null;
  /**
   * Single-line project address (as entered in the admin project form) shown on
   * the hover card. Null for admin placements and projects without location data.
   */
  addressLine: string | null;
  /** GLB url (R2), rendered via MapLibre Three.js custom layer at/above `minZoom`. */
  modelUrl: string;
  /**
   * Hide identity for the replaced OSM extrusion: real `osm_id`, or `mvt:<featureId>`
   * for OpenFreeMap feature ids. Null → tight distance fallback only.
   */
  sourceOsmId: string | null;
  longitude: number;
  latitude: number;
  altitudeM: number;
  headingDeg: number;
  pitchDeg: number;
  rollDeg: number;
  scale: number;
  /** Map zoom at which the 3D model appears (dots stay visible for discoverability). */
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

/**
 * Imperative camera fly for an arbitrary lng/lat (admin address search).
 * Bump `token` to re-trigger `flyTo` for the same center.
 */
export type GeoMapViewRequest = {
  center: GeoMapLngLat;
  zoom?: number;
  token: number;
};

/** Props for `GeoMapCanvas`. Designed for reuse by the admin editor (Stage 2b) and the public map (Stage 3). */
export type GeoMapCanvasProps = {
  /** Objects to render — always-visible dots + GLB models at/above each object's `minZoom`. */
  objects: GeoMapObject[];
  /** MapLibre style URL; defaults to `DEFAULT_MAP_STYLE_URL` (override via `NEXT_PUBLIC_MAP_STYLE_URL`). */
  styleUrl?: string;
  /** Initial camera center; defaults to `DEFAULT_MAP_CENTER_*` (Yerevan). */
  initialCenter?: GeoMapLngLat;
  /** Initial camera zoom; defaults to `DEFAULT_MAP_ZOOM`. */
  initialZoom?: number;
  /**
   * Fixed initial pitch (lab/tests). When omitted, the map mounts at pitch 0
   * and eases once to `DEFAULT_MAP_PITCH_DEG` after style idle.
   */
  initialPitch?: number;
  /** Initial camera bearing; defaults to `DEFAULT_MAP_BEARING_DEG`. */
  initialBearing?: number;
  /**
   * Enables drag-to-move for markers and models and reports the result via
   * `onObjectDragged`. Read-only consumers (public map) must omit this or pass `false`.
   */
  editable?: boolean;
  /** Extra class names for the map container; the caller controls sizing (e.g. `h-[600px]`). */
  className?: string;
  /**
   * Position classes for zoom/rotate/tilt controls (defaults to `top-2.5 right-2.5`).
   * Full-bleed `/map` passes overlay-header clearance so controls sit below the navbar.
   */
  cameraControlsClassName?: string;
  /**
   * When set (and `token` changes), smoothly flies the camera to that object's
   * lng/lat. Backward-compatible — omit for read-only / uncontrolled consumers.
   */
  focusRequest?: GeoMapFocusRequest | undefined;
  /**
   * When set (and `token` changes), flies to `center` (admin address search).
   * Independent from `focusRequest` so object focus stays unchanged.
   */
  viewRequest?: GeoMapViewRequest | undefined;
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
  /**
   * Admin-only live transform preview (sidebar sliders) before Save. Applied
   * before drag override so an in-progress drag still wins for lng/lat.
   */
  transformOverride?: ObjectTransformOverride | null | undefined;
  /**
   * Admin-only: currently selected OSM building for cyan footprint highlight.
   * Ignored when `editable` is false.
   */
  selectedOsmBuilding?: SelectedOsmBuilding | null | undefined;
  /** Admin-only: OSM `building-3d` click (after cyan highlight update). */
  onOsmBuildingSelect?: ((building: SelectedOsmBuilding) => void) | undefined;
  /** Admin-only: top-right selection toolbar (editable maps). */
  adminSelectionChrome?: GeoMapAdminMapSelectionChromeProps | null | undefined;
  /** Admin-only: session OSM building hides merged into the building-3d filter. */
  adminOsmHideSession?: AdminOsmHideSession | null | undefined;
};

export type GeoMapAdminSelectionKind = 'osm' | 'model';

export type PreservedOsmSiblingPart = {
  geometry: { type: 'Polygon'; coordinates: number[][][] };
  heightM: number;
  minHeightM: number;
};

/** Session-only OSM building hides in the admin geo-map editor (not persisted to DB). */
export type AdminOsmHideSession = {
  /** Anchor + identity per hidden building — identity is always distance-scoped. */
  hiddenBuildings: readonly OsmBuildingHideTarget[];
};

export type GeoMapAdminMapSelectionChromeProps = {
  anchor: GeoMapLngLat | null;
  kind: GeoMapAdminSelectionKind | null;
  title: string;
  showAttachProject: boolean;
  isDeleting: boolean;
  onClearSelection: () => void;
  onDeleteModel: () => void;
  onHideOsmBuilding: () => void;
  onFocusCreateUpload: () => void;
  onFocusReplaceUpload: () => void;
  onFocusAttachProject: () => void;
};
