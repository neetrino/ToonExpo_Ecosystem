'use client';

import type { PortalBuildingSummary } from '@toonexpo/contracts';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';

import { AddFloorSheet } from '@/features/builder/components/add-floor-sheet';
import { BuildingPriceOnRequestToggle } from '@/features/builder/components/building-price-on-request-toggle';
import { BuildingPublicationActions } from '@/features/builder/components/building-publication-actions';
import { EditBuildingMediaForm } from '@/features/builder/components/edit-building-media-form';
import { FloorInventoryRow } from '@/features/builder/components/floor-inventory-row';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/cn';

type BuildingAccordionProps = {
  projectId: string;
  building: PortalBuildingSummary;
};

/**
 * Accordion section for a building and its floors.
 */
export const BuildingAccordion = ({ projectId, building }: BuildingAccordionProps) => {
  const t = useTranslations('Builder.inventory');
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [addFloorOpen, setAddFloorOpen] = useState(false);

  return (
    <section className="rounded-sm border border-border">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={
            open
              ? t('collapseBuilding', { name: building.name })
              : t('expandBuilding', { name: building.name })
          }
          onClick={() => {
            setOpen((value) => !value);
          }}
        >
          <ChevronDown
            className={cn(
              'size-4 shrink-0 text-ink-muted transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-premium)] motion-reduce:transition-none',
              open ? 'rotate-0' : '-rotate-90',
            )}
            aria-hidden
          />
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-ink">{building.name}</span>
            <span className="block text-xs text-ink-muted">
              {t('floorsCount', { count: building.floors.length })}
              {building.priceOnRequestEnabled ? ` · ${t('priceOnRequestOn')}` : ''}
            </span>
          </span>
        </button>
        <BuildingPublicationActions projectId={projectId} building={building} />
      </div>

      {open ? (
        <div
          id={panelId}
          className="flex flex-col gap-3 border-t border-border px-4 py-3"
        >
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
