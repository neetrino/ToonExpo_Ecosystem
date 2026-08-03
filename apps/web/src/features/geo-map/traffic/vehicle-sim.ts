import {
  CAR_MODEL_URLS,
  VEHICLE_ANIMATE_MIN_ZOOM,
  VEHICLE_HIGH_PITCH_DEG,
  VEHICLE_HIGH_PITCH_MIN_ZOOM,
  VEHICLE_MAX_COUNT,
  VEHICLE_MIN_GAP_M,
  VEHICLE_MIN_ZOOM,
  VEHICLE_SPACING_M,
  VEHICLE_SPEED_MPS,
} from '@/features/geo-map/traffic/traffic-config';
import type { RoadLine, Vehicle } from '@/features/geo-map/traffic/types';
import { sampleAlongRoad } from '@/features/geo-map/traffic/vector-roads';

/**
 * Spawn a sparse fleet on the longest roads (hard-capped).
 */
export const createSparseVehicles = (
  roads: readonly RoadLine[],
  maxVehicles: number = VEHICLE_MAX_COUNT,
): Vehicle[] => {
  if (roads.length === 0 || maxVehicles <= 0) {
    return [];
  }

  const vehicles: Vehicle[] = [];
  const modelCount = CAR_MODEL_URLS.length;
  const pool = [...roads].sort((a, b) => b.lengthM - a.lengthM);

  for (const road of pool) {
    if (vehicles.length >= maxVehicles) {
      break;
    }
    if (road.lengthM < VEHICLE_SPACING_M + VEHICLE_MIN_GAP_M) {
      continue;
    }
    const startInset = VEHICLE_SPACING_M * 0.5;
    for (let d = startInset; d <= road.lengthM - startInset; d += VEHICLE_SPACING_M) {
      if (vehicles.length >= maxVehicles) {
        break;
      }
      if (isOccupied(vehicles, road.id, d, VEHICLE_MIN_GAP_M)) {
        continue;
      }
      const sample = sampleAlongRoad(road, d);
      vehicles.push({
        id: `car-${vehicles.length}`,
        roadId: road.id,
        distanceM: d,
        speedMps: VEHICLE_SPEED_MPS,
        modelIndex: vehicles.length % modelCount,
        lng: sample.lng,
        lat: sample.lat,
        bearing: sample.bearing,
      });
    }
  }

  return vehicles;
};

/**
 * Advance cars along their roads; wrap to the start of the same road.
 */
export const tickSparseVehicles = (
  vehicles: Vehicle[],
  roadsById: Map<string, RoadLine>,
  dtSec: number,
): void => {
  if (dtSec <= 0 || vehicles.length === 0) {
    return;
  }
  for (const car of vehicles) {
    const road = roadsById.get(car.roadId);
    if (!road) {
      continue;
    }
    car.speedMps = VEHICLE_SPEED_MPS;
    car.distanceM += VEHICLE_SPEED_MPS * dtSec;
    if (car.distanceM >= road.lengthM) {
      car.distanceM = VEHICLE_MIN_GAP_M * 0.5;
    }
    const sample = sampleAlongRoad(road, car.distanceM);
    car.lng = sample.lng;
    car.lat = sample.lat;
    car.bearing = sample.bearing;
  }
};

export const shouldShowVehicles = (zoom: number, pitch: number): boolean => {
  if (zoom >= VEHICLE_MIN_ZOOM) {
    return true;
  }
  return pitch >= VEHICLE_HIGH_PITCH_DEG && zoom >= VEHICLE_HIGH_PITCH_MIN_ZOOM;
};

export const shouldAnimateVehicles = (zoom: number): boolean => zoom >= VEHICLE_ANIMATE_MIN_ZOOM;

const isOccupied = (
  vehicles: readonly Vehicle[],
  roadId: string,
  distanceM: number,
  gap: number,
): boolean => vehicles.some((v) => v.roadId === roadId && Math.abs(v.distanceM - distanceM) < gap);
