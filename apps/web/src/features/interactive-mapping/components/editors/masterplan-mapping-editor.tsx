'use client';

import type { PortalVisualHotspotItem } from '@toonexpo/contracts';

import { MappingEditorShell, type MappingEditorEntity } from './mapping-editor-shell';

export type MasterplanMappingEditorProps = {
  companyId: string;
  canvasId: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  viewBoxWidth: number;
  viewBoxHeight: number;
  districts: { id: string; name: string; label?: string }[];
  hotspots: PortalVisualHotspotItem[];
  onAfterSave?: () => void;
};

const buildEntities = (
  districts: MasterplanMappingEditorProps['districts'],
  hotspots: PortalVisualHotspotItem[],
): MappingEditorEntity[] =>
  districts.map((district) => {
    const hotspot = hotspots.find(
      (item) => item.targetType === 'district' && item.targetId === district.id,
    );
    return {
      id: district.id,
      title: district.name,
      label: hotspot?.label ?? district.label ?? district.name.slice(0, 1).toUpperCase(),
      markerX: hotspot ? Number(hotspot.xPercent) / 100 : null,
      markerY: hotspot ? Number(hotspot.yPercent) / 100 : null,
      svgPath: hotspot?.svgPath ?? null,
      hotspotId: hotspot?.id ?? null,
    };
  });

/**
 * Phase 1 — districts on project masterplan.
 */
export const MasterplanMappingEditor = ({
  companyId,
  canvasId,
  imageUrl,
  imageWidth,
  imageHeight,
  viewBoxWidth,
  viewBoxHeight,
  districts,
  hotspots,
  onAfterSave,
}: MasterplanMappingEditorProps) => (
  <MappingEditorShell
    companyId={companyId}
    canvasId={canvasId}
    targetType="district"
    toolPreset="basic"
    listTitle="Districts"
    imageUrl={imageUrl}
    imageWidth={imageWidth}
    imageHeight={imageHeight}
    viewBoxWidth={viewBoxWidth}
    viewBoxHeight={viewBoxHeight}
    initialEntities={buildEntities(districts, hotspots)}
    onAfterSave={onAfterSave}
  />
);
