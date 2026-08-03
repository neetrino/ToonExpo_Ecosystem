import {
  createSeededRandom,
  seededRange,
} from '@/features/geo-map/vegetation/deterministic-random';
import {
  DEFAULT_GRASS_CONFIG,
  GRASS_QUALITY,
  type GrassConfig,
} from '@/features/geo-map/vegetation/grass-config';
import { flattenParkPolygons } from '@/features/geo-map/vegetation/park-feature-extractor';
import type { LngLat } from '@/features/geo-map/vegetation/polygon-geometry';
import { samplePolygonGrid } from '@/features/geo-map/vegetation/sample-polygon-grid';
import {
  isPointExcluded,
  type ExclusionSet,
} from '@/features/geo-map/vegetation/tree-collision-filter';
import type {
  GrassInstanceSpec,
  ParkFeatureRecord,
  VegetationQualityId,
} from '@/features/geo-map/vegetation/types';

/**
 * Sparse grass tuft sampling inside a park polygon.
 */
export const generateGrassForPark = (
  park: ParkFeatureRecord,
  config: GrassConfig,
  qualityId: VegetationQualityId,
  exclusions: ExclusionSet,
  origin: LngLat,
  remainingCap: number,
): { instances: GrassInstanceSpec[]; rejected: number } => {
  if (remainingCap <= 0 || !config.enabled) {
    return { instances: [], rejected: 0 };
  }

  const quality = GRASS_QUALITY[qualityId];
  const spacing = Math.max(
    0.45,
    config.minSpacingMeters / Math.max(0.5, quality.densityMultiplier),
  );
  const coverCount = Math.ceil(park.areaM2 / (spacing * spacing));
  const budget = Math.min(
    config.maxBladesPerFeature,
    Math.max(config.minBladesPerFeature, coverCount),
    remainingCap,
  );

  const instances: GrassInstanceSpec[] = [];
  let rejected = 0;
  const randBase = `${config.seed}:${config.configVersion}:${park.id}`;

  for (const poly of flattenParkPolygons(park)) {
    if (instances.length >= budget) {
      break;
    }
    const seed = `${randBase}:grass:${poly.ring[0]?.[0]}`;
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
      instances.push({
        id: `${park.id}:g:${instances.length}`,
        lng,
        lat,
        rotationY: seededRange(rand, 0, Math.PI * 2),
        scaleX: config.bladeWidthM * seededRange(rand, 0.75, 1.25),
        scaleY: seededRange(rand, config.bladeHeightMinM, config.bladeHeightMaxM),
      });
    }
  }

  return { instances, rejected };
};

export const defaultGrassConfig = (): GrassConfig => ({ ...DEFAULT_GRASS_CONFIG });
