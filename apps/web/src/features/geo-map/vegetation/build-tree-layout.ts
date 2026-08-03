import {
  createSeededRandom,
  pickWeightedSpecies,
  seededRange,
} from '@/features/geo-map/vegetation/deterministic-random';
import { flattenParkPolygons } from '@/features/geo-map/vegetation/park-feature-extractor';
import type { LngLat } from '@/features/geo-map/vegetation/polygon-geometry';
import { samplePolygonGrid } from '@/features/geo-map/vegetation/sample-polygon-grid';
import {
  collectExclusions,
  isPointExcluded,
  type ExclusionSet,
} from '@/features/geo-map/vegetation/tree-collision-filter';
import type {
  ParkFeatureRecord,
  TreeInstanceSpec,
  TreeSpeciesId,
  VegetationConfig,
  VegetationQualityPreset,
} from '@/features/geo-map/vegetation/types';

/**
 * Stable per-park tree generation. Same park id + config → same trees.
 */
export const generateTreesForPark = (
  park: ParkFeatureRecord,
  config: VegetationConfig,
  quality: VegetationQualityPreset,
  exclusions: ExclusionSet,
  origin: LngLat,
  remainingCap: number,
): { instances: TreeInstanceSpec[]; rejected: number } => {
  if (remainingCap <= 0) {
    return { instances: [], rejected: 0 };
  }

  const spacing = Math.max(1.8, config.minSpacingMeters / Math.max(0.5, quality.densityMultiplier));
  const coverCount = Math.ceil(park.areaM2 / (spacing * spacing));
  const budget = Math.min(
    config.maxTreesPerFeature,
    Math.max(config.minTreesPerFeature, coverCount),
    remainingCap,
  );

  const instances: TreeInstanceSpec[] = [];
  let rejected = 0;
  const randBase = `${config.seed}:${config.configVersion}:${park.id}`;

  for (const poly of flattenParkPolygons(park)) {
    if (instances.length >= budget) {
      break;
    }
    const seed = `${randBase}:${poly.ring[0]?.[0]}`;
    const sampled = samplePolygonGrid({
      ring: poly.ring,
      holes: poly.holes,
      spacingM: spacing,
      edgePaddingM: config.edgePaddingMeters,
      maxPoints: budget - instances.length,
      seed,
    });
    rejected += sampled.rejected;

    const rand = createSeededRandom(`${seed}:var`);
    for (const [lng, lat] of sampled.points) {
      if (instances.length >= budget) {
        break;
      }
      if (isPointExcluded(lng, lat, origin, exclusions)) {
        rejected++;
        continue;
      }
      const species = pickWeightedSpecies(rand, config.speciesWeights) as TreeSpeciesId;
      instances.push({
        id: `${park.id}:${instances.length}`,
        lng,
        lat,
        species,
        rotationY: seededRange(rand, 0, Math.PI * 2),
        scale: seededRange(rand, 0.75, 1.2),
      });
    }
  }

  return { instances, rejected };
};

export const buildTreesForParks = (
  parks: readonly ParkFeatureRecord[],
  config: VegetationConfig,
  quality: VegetationQualityPreset,
  map: Parameters<typeof collectExclusions>[0],
  globalCap: number,
): TreeInstanceSpec[] => {
  if (parks.length === 0 || globalCap <= 0) {
    return [];
  }
  const origin = parks[0]!.centroid;
  const exclusions = collectExclusions(map, origin);
  const instances: TreeInstanceSpec[] = [];
  for (const park of parks) {
    if (instances.length >= globalCap) {
      break;
    }
    const part = generateTreesForPark(
      park,
      config,
      quality,
      exclusions,
      origin,
      globalCap - instances.length,
    );
    instances.push(...part.instances);
  }
  return instances;
};

/** Cap a flat instance list to `max` while keeping park locality order. */
export const capTreeInstances = (
  instances: readonly TreeInstanceSpec[],
  max: number,
): TreeInstanceSpec[] => (instances.length <= max ? [...instances] : instances.slice(0, max));
