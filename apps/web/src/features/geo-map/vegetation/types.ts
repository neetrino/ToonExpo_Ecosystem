/** Shared vegetation types for park trees + grass. */

export type TreeSpeciesId = 'deciduous' | 'compact' | 'conifer';

export type VegetationQualityId = 'low' | 'medium';

export type TreeInstanceSpec = {
  id: string;
  lng: number;
  lat: number;
  species: TreeSpeciesId;
  rotationY: number;
  scale: number;
};

export type GrassInstanceSpec = {
  id: string;
  lng: number;
  lat: number;
  rotationY: number;
  scaleX: number;
  scaleY: number;
};

export type ParkFeatureRecord = {
  id: string;
  source: string;
  sourceLayer: string;
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  properties: Record<string, unknown>;
  areaM2: number;
  centroid: [number, number];
};

export type VegetationConfig = {
  enabled: boolean;
  minZoom: number;
  maxZoom: number;
  minSpacingMeters: number;
  edgePaddingMeters: number;
  maxTreesPerFeature: number;
  minTreesPerFeature: number;
  seed: string;
  configVersion: string;
  groundOffsetMeters: number;
  buildingBufferMeters: number;
  roadBufferMeters: number;
  speciesWeights: Record<TreeSpeciesId, number>;
};

export type VegetationQualityPreset = {
  densityMultiplier: number;
  maxInstances: number;
};
