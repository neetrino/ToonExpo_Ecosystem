'use client';

import type { PortalVisualHotspotItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { hotspotToMappingCoords } from '../../utils/hotspot-geometry';
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
  createForm?: ReactNode;
  onDeleteApartment?: ((id: string) => Promise<void>) | undefined;
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
      label: hotspot ? (hotspot.label ?? '') : (apartment.label ?? apartment.number),
      ...(hotspot
        ? hotspotToMappingCoords(hotspot)
        : { markerX: null, markerY: null, svgPath: null }),
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
  createForm,
  onDeleteApartment,
  onAfterSave,
}: FloorApartmentMappingEditorProps) => {
  const t = useTranslations('Admin.interactiveMapping.canvas');
  const tForms = useTranslations('Admin.interactiveMapping.forms');

  return (
    <MappingEditorShell
      companyId={companyId}
      canvasId={canvasId}
      targetType="apartment"
      toolPreset="basic"
      listTitle={t('apartmentsListTitle')}
      emptyHint={t('emptyFloorHint')}
      searchPlaceholder={tForms('searchApartments')}
      sidebarFooter={createForm}
      labelDigitsOnly
      deleteEntityLabel={t('deleteApartment')}
      imageUrl={imageUrl}
      imageWidth={imageWidth}
      imageHeight={imageHeight}
      viewBoxWidth={viewBoxWidth}
      viewBoxHeight={viewBoxHeight}
      initialEntities={buildEntities(apartments, hotspots)}
      onDeleteEntity={onDeleteApartment}
      onAfterSave={onAfterSave}
    />
  );
};
