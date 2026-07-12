'use client';

import type { ApartmentStatus, PublicationStatus } from '@toonexpo/domain';
import { useState } from 'react';

import type { BuilderProjectDetail } from '@/lib/builder/queries';

import { BuildingFormSheet } from '../sheets/building-form-sheet';
import { BuildingCard } from './building-card';

type BuildingsSectionProps = {
  locale: string;
  project: BuilderProjectDetail;
  labels: {
    title: string;
    addBuilding: string;
    empty: string;
    editBuilding: string;
    addFloor: string;
    floors: string;
    level: string;
    editFloor: string;
    apartment: {
      title: string;
      code: string;
      rooms: string;
      areaSqm: string;
      priceAmd: string;
      status: string;
      actions: string;
      noValue: string;
      edit: string;
      addApartment: string;
      media: string;
    };
  };
  statusLabels: Record<ApartmentStatus, string>;
  publicationStatusLabels: Record<PublicationStatus, string>;
};

export function BuildingsSection({
  locale,
  project,
  labels,
  statusLabels,
  publicationStatusLabels,
}: BuildingsSectionProps) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <section className="portal-section">
      <div className="portal-section__header">
        <h3 className="portal-section__title">{labels.title}</h3>
        <button
          type="button"
          className="portal-btn portal-btn--primary"
          onClick={() => setCreateOpen(true)}
        >
          {labels.addBuilding}
        </button>
      </div>

      {project.buildings.length === 0 ? (
        <p className="portal-empty">{labels.empty}</p>
      ) : (
        project.buildings.map((building) => (
          <BuildingCard
            key={building.id}
            locale={locale}
            building={building}
            labels={{
              editBuilding: labels.editBuilding,
              addFloor: labels.addFloor,
              floors: labels.floors,
              level: labels.level,
              editFloor: labels.editFloor,
              apartment: labels.apartment,
            }}
            statusLabels={statusLabels}
            publicationStatusLabels={publicationStatusLabels}
          />
        ))
      )}

      <BuildingFormSheet
        locale={locale}
        mode="create"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        values={{ projectId: project.id, name: '' }}
      />
    </section>
  );
}
