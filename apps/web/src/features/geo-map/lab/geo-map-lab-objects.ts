import { DEFAULT_MODEL_MIN_ZOOM } from '@/features/geo-map/constants';
import type { GeoMapObject } from '@/features/geo-map/types';

const KHRONOS_SAMPLE_MODELS_BASE_URL =
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0';

/** Publicly reachable sample GLBs (Khronos glTF-Sample-Models) — QA only, not project assets. */
const DUCK_MODEL_URL = `${KHRONOS_SAMPLE_MODELS_BASE_URL}/Duck/glTF-Binary/Duck.glb`;
const AVOCADO_MODEL_URL = `${KHRONOS_SAMPLE_MODELS_BASE_URL}/Avocado/glTF-Binary/Avocado.glb`;

const DUCK_MODEL_SCALE = 40;
const AVOCADO_MODEL_SCALE = 400;

/** 3 hardcoded sample objects for the `GeoMapCanvas` lab — headed QA only (Stage 2a). */
export const GEO_MAP_LAB_OBJECTS: GeoMapObject[] = [
  {
    id: 'lab-1',
    projectId: 'lab-project-1',
    label: 'Toon Duck Tower',
    logoUrl: null,
    modelUrl: DUCK_MODEL_URL,
    longitude: 44.5152,
    latitude: 40.1872,
    altitudeM: 0,
    headingDeg: 0,
    pitchDeg: 0,
    rollDeg: 0,
    scale: DUCK_MODEL_SCALE,
    minZoom: DEFAULT_MODEL_MIN_ZOOM,
  },
  {
    id: 'lab-2',
    projectId: 'lab-project-2',
    label: 'Avocado Residences',
    logoUrl: null,
    modelUrl: AVOCADO_MODEL_URL,
    longitude: 44.522,
    latitude: 40.191,
    altitudeM: 0,
    headingDeg: 45,
    pitchDeg: 0,
    rollDeg: 0,
    scale: AVOCADO_MODEL_SCALE,
    minZoom: DEFAULT_MODEL_MIN_ZOOM,
  },
  {
    id: 'lab-3',
    projectId: 'lab-project-3',
    label: 'Duck Plaza South',
    logoUrl: null,
    modelUrl: DUCK_MODEL_URL,
    longitude: 44.508,
    latitude: 40.181,
    altitudeM: 0,
    headingDeg: 200,
    pitchDeg: 0,
    rollDeg: 0,
    scale: DUCK_MODEL_SCALE,
    minZoom: DEFAULT_MODEL_MIN_ZOOM,
  },
];
