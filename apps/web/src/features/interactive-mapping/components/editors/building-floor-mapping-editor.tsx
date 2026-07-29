'use client';

import type { PortalVisualHotspotItem } from '@toonexpo/contracts';

import { MappingEditorShell, type MappingEditorEntity } from './mapping-editor-shell';

export type BuildingFloorMappingEditorProps = {
  companyId: string;
  canvasId: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  viewBoxWidth: number;
  viewBoxHeight: number;
  floors: { id: string; name: string; number: number; label?: string }[];
  hotspots: PortalVisualHotspotItem[];
  onAfterSave?: () => void;
};

const buildEntities = (
  floors: BuildingFloorMappingEditorProps['floors'],
  hotspots: PortalVisualHotspotItem[],
): MappingEditorEntity[] =>
  [...floors]
    .sort((a, b) => a.number - b.number)
    .map((floor) => {
      const hotspot = hotspots.find(
        (item) => item.targetType === 'floor' && item.targetId === floor.id,
      );
      return {
        id: floor.id,
        title: floor.name || `Floor ${floor.number}`,
        label: hotspot?.label ?? floor.label ?? String(floor.number),
        markerX: hotspot ? Number(hotspot.xPercent) / 100 : null,
        markerY: hotspot ? Number(hotspot.yPercent) / 100 : null,
        svgPath: hotspot?.svgPath ?? null,
        hotspotId: hotspot?.id ?? null,
      };
    });

/**
 * Phase 3 — floors on building render (band + auto-stack).
 */
export const BuildingFloorMappingEditor = ({
  companyId,
  canvasId,
  imageUrl,
  imageWidth,
  imageHeight,
  viewBoxWidth,
  viewBoxHeight,
  floors,
  hotspots,
  onAfterSave,
}: BuildingFloorMappingEditorProps) => (
  <MappingEditorShell
    companyId={companyId}
    canvasId={canvasId}
    targetType="floor"
    toolPreset="floors"
    listTitle="Floors"
    imageUrl={imageUrl}
    imageWidth={imageWidth}
    imageHeight={imageHeight}
    viewBoxWidth={viewBoxWidth}
    viewBoxHeight={viewBoxHeight}
    initialEntities={buildEntities(floors, hotspots)}
    onAfterSave={onAfterSave}
  />
);
