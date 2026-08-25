'use client';

import type { PortalVisualHotspotItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { hotspotToMappingCoords } from '../../utils/hotspot-geometry';
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
  createForm?: ReactNode;
  onDeleteDistrict?: ((id: string) => Promise<void>) | undefined;
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
      ...(hotspot
        ? hotspotToMappingCoords(hotspot)
        : { markerX: null, markerY: null, svgPath: null }),
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
  createForm,
  onDeleteDistrict,
  onAfterSave,
}: MasterplanMappingEditorProps) => {
  const t = useTranslations('Admin.interactiveMapping.canvas');

  return (
    <MappingEditorShell
      companyId={companyId}
      canvasId={canvasId}
      targetType="district"
      toolPreset="basic"
      listTitle={t('districtsListTitle')}
      sidebarFooter={createForm}
      deleteEntityLabel={t('deleteDistrict')}
      confirmDeleteMessage={t('confirmDeleteDistrict')}
      imageUrl={imageUrl}
      imageWidth={imageWidth}
      imageHeight={imageHeight}
      viewBoxWidth={viewBoxWidth}
      viewBoxHeight={viewBoxHeight}
      initialEntities={buildEntities(districts, hotspots)}
      onDeleteEntity={onDeleteDistrict}
      onAfterSave={onAfterSave}
    />
  );
};
