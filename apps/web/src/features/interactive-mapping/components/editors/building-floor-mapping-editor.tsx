'use client';

import type { PortalVisualHotspotItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { hotspotToMappingCoords } from '../../utils/hotspot-geometry';
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
  createForm?: ReactNode;
  onDeleteFloor?: ((id: string) => Promise<void>) | undefined;
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
        label: hotspot ? (hotspot.label ?? '') : (floor.label ?? String(floor.number)),
        ...(hotspot
          ? hotspotToMappingCoords(hotspot)
          : { markerX: null, markerY: null, svgPath: null }),
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
  createForm,
  onDeleteFloor,
  onAfterSave,
}: BuildingFloorMappingEditorProps) => {
  const t = useTranslations('Admin.interactiveMapping.canvas');
  const tForms = useTranslations('Admin.interactiveMapping.forms');

  return (
    <MappingEditorShell
      companyId={companyId}
      canvasId={canvasId}
      targetType="floor"
      toolPreset="floors"
      listTitle={t('floorsListTitle')}
      searchPlaceholder={tForms('searchFloors')}
      sidebarFooter={createForm}
      deleteEntityLabel={t('deleteFloor')}
      confirmDeleteMessage={t('confirmDeleteFloor')}
      imageUrl={imageUrl}
      imageWidth={imageWidth}
      imageHeight={imageHeight}
      viewBoxWidth={viewBoxWidth}
      viewBoxHeight={viewBoxHeight}
      initialEntities={buildEntities(floors, hotspots)}
      onDeleteEntity={onDeleteFloor}
      onAfterSave={onAfterSave}
    />
  );
};
