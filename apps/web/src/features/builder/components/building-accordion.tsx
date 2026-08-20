'use client';

import type { PortalBuildingSummary } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { AddFloorSheet } from '@/features/builder/components/add-floor-sheet';
import { BuildingPriceOnRequestToggle } from '@/features/builder/components/building-price-on-request-toggle';
import { EditBuildingMediaForm } from '@/features/builder/components/edit-building-media-form';
import { FloorInventoryRow } from '@/features/builder/components/floor-inventory-row';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';

type BuildingAccordionProps = {
  projectId: string;
  building: PortalBuildingSummary;
};

/**
 * Accordion section for a building and its floors.
 */
export const BuildingAccordion = ({ projectId, building }: BuildingAccordionProps) => {
  const t = useTranslations('Builder.inventory');
  const [open, setOpen] = useState(true);
  const [addFloorOpen, setAddFloorOpen] = useState(false);

  return (
    <section className="rounded-sm border border-border">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
        }}
      >
        <span>
          <span className="block text-sm font-semibold text-ink">{building.name}</span>
          <span className="block text-xs text-ink-muted">
            {t('floorsCount', { count: building.floors.length })} ·{' '}
            {t(`publication.${building.publicationStatus}`)}
          {building.priceOnRequestEnabled ? ` · ${t('priceOnRequestOn')}` : ''}
          </span>
        </span>
        <span className="text-ink-muted" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </button>

      {open ? (
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3">
          <BuildingPriceOnRequestToggle projectId={projectId} building={building} />
          {building.floors.length === 0 ? (
            <p className="text-sm text-ink-secondary">{t('noFloors')}</p>
          ) : (
            building.floors.map((floor) => (
              <FloorInventoryRow key={floor.id} projectId={projectId} floor={floor} />
            ))
          )}
          <EditBuildingMediaForm projectId={projectId} building={building} />
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setAddFloorOpen(true);
              }}
            >
              <AddActionLabel>{t('addFloor')}</AddActionLabel>
            </Button>
          </div>
        </div>
      ) : null}

      <AddFloorSheet
        open={addFloorOpen}
        onClose={() => {
          setAddFloorOpen(false);
        }}
        projectId={projectId}
        buildingId={building.id}
      />
    </section>
  );
};
