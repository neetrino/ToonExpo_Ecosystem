'use client';

import type { PortalVisualHotspotItem } from '@toonexpo/contracts';

import { MappingEditorShell, type MappingEditorEntity } from './mapping-editor-shell';

export type DistrictBuildingEditorProps = {
  companyId: string;
  canvasId: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  viewBoxWidth: number;
  viewBoxHeight: number;
  buildings: { id: string; name: string; label?: string }[];
  hotspots: PortalVisualHotspotItem[];
  onAfterSave?: () => void;
};

const buildEntities = (
  buildings: DistrictBuildingEditorProps['buildings'],
  hotspots: PortalVisualHotspotItem[],
): MappingEditorEntity[] =>
  buildings.map((building) => {
    const hotspot = hotspots.find(
      (item) => item.targetType === 'building' && item.targetId === building.id,
    );
    return {
      id: building.id,
      title: building.name,
      label: hotspot?.label ?? building.label ?? building.name.slice(0, 2),
      markerX: hotspot ? Number(hotspot.xPercent) / 100 : null,
      markerY: hotspot ? Number(hotspot.yPercent) / 100 : null,
      svgPath: hotspot?.svgPath ?? null,
      hotspotId: hotspot?.id ?? null,
    };
  });

/**
 * Phase 2 — buildings on a district plan.
 */
export const DistrictBuildingEditor = ({
  companyId,
  canvasId,
  imageUrl,
  imageWidth,
  imageHeight,
  viewBoxWidth,
  viewBoxHeight,
  buildings,
  hotspots,
  onAfterSave,
}: DistrictBuildingEditorProps) => (
  <MappingEditorShell
    companyId={companyId}
    canvasId={canvasId}
    targetType="building"
    toolPreset="basic"
    listTitle="Buildings"
    imageUrl={imageUrl}
    imageWidth={imageWidth}
    imageHeight={imageHeight}
    viewBoxWidth={viewBoxWidth}
    viewBoxHeight={viewBoxHeight}
    initialEntities={buildEntities(buildings, hotspots)}
    onAfterSave={onAfterSave}
  />
);
