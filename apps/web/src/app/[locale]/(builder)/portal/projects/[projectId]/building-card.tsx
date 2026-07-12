'use client';

import type { ApartmentStatus, PublicationStatus } from '@toonexpo/domain';
import { useState } from 'react';

import type { BuilderProjectBuilding } from '@/lib/builder/queries';
import { STATUS_BADGE_CLASS } from '@/lib/shared/publication';

import { BuildingFormSheet } from '../sheets/building-form-sheet';
import { FloorFormSheet } from '../sheets/floor-form-sheet';
import { FloorBlock } from './floor-block';

type BuildingCardProps = {
  locale: string;
  building: BuilderProjectBuilding;
  labels: {
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
  formatPrice: (value: number) => string;
};

export function BuildingCard({
  locale,
  building,
  labels,
  statusLabels,
  publicationStatusLabels,
  formatPrice,
}: BuildingCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [createFloorOpen, setCreateFloorOpen] = useState(false);

  return (
    <article className="portal-card">
      <div className="portal-card__header">
        <div className="portal-page__heading">
          <h3 className="portal-card__title">{building.name}</h3>
          <span className={STATUS_BADGE_CLASS[building.status]}>
            {publicationStatusLabels[building.status]}
          </span>
        </div>
        <div className="portal-actions">
          <button
            type="button"
            className="portal-btn portal-btn--ghost portal-btn--sm"
            onClick={() => setCreateFloorOpen(true)}
          >
            {labels.addFloor}
          </button>
          <button
            type="button"
            className="portal-btn portal-btn--ghost portal-btn--sm"
            onClick={() => setEditOpen(true)}
          >
            {labels.editBuilding}
          </button>
        </div>
      </div>

      {building.floors.length === 0 ? (
        <p className="portal-empty">{labels.floors}</p>
      ) : (
        building.floors.map((floor) => (
          <FloorBlock
            key={floor.id}
            locale={locale}
            buildingId={building.id}
            floor={floor}
            labels={{
              level: labels.level,
              editFloor: labels.editFloor,
              apartment: labels.apartment,
            }}
            statusLabels={statusLabels}
            publicationStatusLabels={publicationStatusLabels}
            formatPrice={formatPrice}
          />
        ))
      )}

      <BuildingFormSheet
        locale={locale}
        mode="edit"
        open={editOpen}
        onClose={() => setEditOpen(false)}
        values={{
          buildingId: building.id,
          name: building.name,
          description: building.description,
          status: building.status,
        }}
        statusLabel={publicationStatusLabels[building.status]}
      />

      <FloorFormSheet
        locale={locale}
        mode="create"
        open={createFloorOpen}
        onClose={() => setCreateFloorOpen(false)}
        values={{ buildingId: building.id, name: '', level: 1 }}
      />
    </article>
  );
}
