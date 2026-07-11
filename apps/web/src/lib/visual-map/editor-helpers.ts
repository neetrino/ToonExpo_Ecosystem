import type { VisualMapContextType } from '@toonexpo/contracts';

import type { BuilderProjectDetail } from '@/lib/builder/queries';

export type HotspotTargetOption = {
  value: string;
  label: string;
  buildingId?: string;
  floorId?: string;
  apartmentId?: string;
};

export function resolveCanvasContextType(canvas: {
  projectId: string | null;
  buildingId: string | null;
  floorId: string | null;
}): VisualMapContextType {
  if (canvas.floorId) {
    return 'floor';
  }
  if (canvas.buildingId) {
    return 'building';
  }
  return 'project';
}

export function listHotspotTargetOptions(
  project: BuilderProjectDetail,
  contextType: VisualMapContextType,
  canvas: { buildingId: string | null; floorId: string | null },
): HotspotTargetOption[] {
  if (contextType === 'project') {
    return project.buildings.map((building) => ({
      value: `building:${building.id}`,
      label: building.name,
      buildingId: building.id,
    }));
  }

  if (contextType === 'building') {
    const building = project.buildings.find((item) => item.id === canvas.buildingId);
    if (!building) {
      return [];
    }
    return building.floors.map((floor) => ({
      value: `floor:${floor.id}`,
      label: `${floor.name} (${floor.level})`,
      floorId: floor.id,
    }));
  }

  const floor = project.buildings
    .flatMap((building) => building.floors)
    .find((item) => item.id === canvas.floorId);
  if (!floor) {
    return [];
  }

  return floor.apartments.map((apartment) => ({
    value: `apartment:${apartment.id}`,
    label: apartment.code,
    apartmentId: apartment.id,
  }));
}

export function parseHotspotTargetValue(value: string): {
  buildingId?: string;
  floorId?: string;
  apartmentId?: string;
} {
  const [kind, id] = value.split(':');
  if (!id) {
    return {};
  }
  if (kind === 'building') {
    return { buildingId: id };
  }
  if (kind === 'floor') {
    return { floorId: id };
  }
  if (kind === 'apartment') {
    return { apartmentId: id };
  }
  return {};
}

export function hotspotTargetValue(hotspot: {
  buildingId: string | null;
  floorId: string | null;
  apartmentId: string | null;
}): string {
  if (hotspot.buildingId) {
    return `building:${hotspot.buildingId}`;
  }
  if (hotspot.floorId) {
    return `floor:${hotspot.floorId}`;
  }
  if (hotspot.apartmentId) {
    return `apartment:${hotspot.apartmentId}`;
  }
  return '';
}

export function resolveCanvasContextLabel(
  project: BuilderProjectDetail,
  canvas: {
    projectId: string | null;
    buildingId: string | null;
    floorId: string | null;
  },
  labels: { project: string; building: string; floor: string },
): string {
  const contextType = resolveCanvasContextType(canvas);
  if (contextType === 'project') {
    return labels.project;
  }
  if (contextType === 'building') {
    const building = project.buildings.find((item) => item.id === canvas.buildingId);
    return building ? `${labels.building}: ${building.name}` : labels.building;
  }
  const floor = project.buildings
    .flatMap((building) =>
      building.floors.map((item) => ({ ...item, buildingName: building.name })),
    )
    .find((item) => item.id === canvas.floorId);
  return floor ? `${labels.floor}: ${floor.buildingName} · ${floor.name}` : labels.floor;
}
