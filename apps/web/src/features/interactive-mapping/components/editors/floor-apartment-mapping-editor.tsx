'use client';

import type { PortalVisualHotspotItem } from '@toonexpo/contracts';

import { MappingEditorShell, type MappingEditorEntity } from './mapping-editor-shell';

export type FloorApartmentMappingEditorProps = {
  companyId: string;
  canvasId: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  viewBoxWidth: number;
  viewBoxHeight: number;
  apartments: { id: string; number: string; label?: string }[];
  hotspots: PortalVisualHotspotItem[];
  onAfterSave?: () => void;
};

const buildEntities = (
  apartments: FloorApartmentMappingEditorProps['apartments'],
  hotspots: PortalVisualHotspotItem[],
): MappingEditorEntity[] =>
  apartments.map((apartment) => {
    const hotspot = hotspots.find(
      (item) => item.targetType === 'apartment' && item.targetId === apartment.id,
    );
    return {
      id: apartment.id,
      title: apartment.number,
      label: hotspot?.label ?? apartment.label ?? apartment.number,
      markerX: hotspot ? Number(hotspot.xPercent) / 100 : null,
      markerY: hotspot ? Number(hotspot.yPercent) / 100 : null,
      svgPath: hotspot?.svgPath ?? null,
      hotspotId: hotspot?.id ?? null,
    };
  });

/**
 * Phase 4 — apartments on a floor plan.
 */
export const FloorApartmentMappingEditor = ({
  companyId,
  canvasId,
  imageUrl,
  imageWidth,
  imageHeight,
  viewBoxWidth,
  viewBoxHeight,
  apartments,
  hotspots,
  onAfterSave,
}: FloorApartmentMappingEditorProps) => (
  <MappingEditorShell
    companyId={companyId}
    canvasId={canvasId}
    targetType="apartment"
    toolPreset="basic"
    listTitle="Apartments"
    imageUrl={imageUrl}
    imageWidth={imageWidth}
    imageHeight={imageHeight}
    viewBoxWidth={viewBoxWidth}
    viewBoxHeight={viewBoxHeight}
    initialEntities={buildEntities(apartments, hotspots)}
    onAfterSave={onAfterSave}
  />
);
