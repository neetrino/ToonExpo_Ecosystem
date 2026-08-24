'use client';

import type { PortalProjectDetail } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { AddBuildingSheet } from '@/features/builder/components/add-building-sheet';
import { BuildingAccordion } from '@/features/builder/components/building-accordion';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';

type ProjectInventorySectionProps = {
  project: PortalProjectDetail;
};

/**
 * Nested buildings → floors → apartments management for a project.
 */
export const ProjectInventorySection = ({ project }: ProjectInventorySectionProps) => {
  const t = useTranslations('Builder.inventory');
  const [addBuildingOpen, setAddBuildingOpen] = useState(false);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">{t('title')}</h2>
          <p className="text-sm text-ink-secondary">{t('subtitle')}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="shrink-0"
          onClick={() => {
            setAddBuildingOpen(true);
          }}
        >
          <AddActionLabel>{t('addBuilding')}</AddActionLabel>
        </Button>
      </div>

      {project.buildings.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t('noBuildings')}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {project.buildings.map((building) => (
            <BuildingAccordion key={building.id} projectId={project.id} building={building} />
          ))}
        </div>
      )}

      <AddBuildingSheet
        open={addBuildingOpen}
        onClose={() => {
          setAddBuildingOpen(false);
        }}
        projectId={project.id}
      />
    </section>
  );
};
