'use client';

import type { ApartmentStatus } from '@toonexpo/domain';
import { useState } from 'react';

import type { BuilderProjectFloor } from '@/lib/builder/queries';

import { FloorFormSheet } from '../sheets/floor-form-sheet';
import { ApartmentTable } from './apartment-table';

type FloorBlockLabels = {
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
  };
};

type FloorBlockProps = {
  locale: string;
  buildingId: string;
  floor: BuilderProjectFloor;
  labels: FloorBlockLabels;
  statusLabels: Record<ApartmentStatus, string>;
  formatPrice: (value: number) => string;
};

export function FloorBlock({
  locale,
  buildingId,
  floor,
  labels,
  statusLabels,
  formatPrice,
}: FloorBlockProps) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <article className="portal-subsection">
      <div className="portal-subsection__header">
        <h4 className="portal-subsection__title">
          {floor.name} ({labels.level} {floor.level})
        </h4>
        <button
          type="button"
          className="portal-btn portal-btn--ghost portal-btn--sm"
          onClick={() => setEditOpen(true)}
        >
          {labels.editFloor}
        </button>
      </div>

      <ApartmentTable
        locale={locale}
        floorId={floor.id}
        apartments={floor.apartments}
        labels={labels.apartment}
        statusLabels={statusLabels}
        formatPrice={formatPrice}
      />

      <FloorFormSheet
        locale={locale}
        mode="edit"
        open={editOpen}
        onClose={() => setEditOpen(false)}
        values={{
          floorId: floor.id,
          buildingId,
          name: floor.name,
          level: floor.level,
        }}
      />
    </article>
  );
}
