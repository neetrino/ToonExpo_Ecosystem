'use client';

import type { ApartmentStatus } from '@toonexpo/domain';
import { useState } from 'react';

import type { BuilderProjectApartment } from '@/lib/builder/queries';

import { ApartmentFormSheet } from '../sheets/apartment-form-sheet';

type ApartmentTableLabels = {
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

type ApartmentTableProps = {
  locale: string;
  floorId: string;
  apartments: BuilderProjectApartment[];
  labels: ApartmentTableLabels;
  statusLabels: Record<ApartmentStatus, string>;
  formatPrice: (value: number) => string;
};

export function ApartmentTable({
  locale,
  floorId,
  apartments,
  labels,
  statusLabels,
  formatPrice,
}: ApartmentTableProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingApartment, setEditingApartment] = useState<BuilderProjectApartment | null>(null);

  return (
    <div className="portal-subsection">
      <div className="portal-subsection__header">
        <h4 className="portal-subsection__title">{labels.title}</h4>
        <button
          type="button"
          className="portal-btn portal-btn--ghost portal-btn--sm"
          onClick={() => setCreateOpen(true)}
        >
          {labels.addApartment}
        </button>
      </div>

      {apartments.length === 0 ? (
        <p className="portal-empty">{labels.noValue}</p>
      ) : (
        <div className="portal-table-wrap">
          <table className="portal-table">
            <thead>
              <tr>
                <th>{labels.code}</th>
                <th>{labels.rooms}</th>
                <th>{labels.areaSqm}</th>
                <th>{labels.priceAmd}</th>
                <th>{labels.status}</th>
                <th>{labels.actions}</th>
              </tr>
            </thead>
            <tbody>
              {apartments.map((apartment) => (
                <tr key={apartment.id}>
                  <td>{apartment.code}</td>
                  <td>{apartment.rooms ?? labels.noValue}</td>
                  <td>{apartment.areaSqm ?? labels.noValue}</td>
                  <td>
                    {apartment.priceAmd != null ? formatPrice(apartment.priceAmd) : labels.noValue}
                  </td>
                  <td>
                    <span
                      className={`portal-apartment-status portal-apartment-status--${apartment.status}`}
                    >
                      {statusLabels[apartment.status]}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="portal-btn portal-btn--ghost portal-btn--sm"
                      onClick={() => setEditingApartment(apartment)}
                    >
                      {labels.edit}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ApartmentFormSheet
        locale={locale}
        mode="create"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        values={{ floorId, code: '', status: 'AVAILABLE' }}
      />

      {editingApartment ? (
        <ApartmentFormSheet
          locale={locale}
          mode="edit"
          open
          onClose={() => setEditingApartment(null)}
          values={{
            apartmentId: editingApartment.id,
            floorId,
            code: editingApartment.code,
            rooms: editingApartment.rooms,
            areaSqm: editingApartment.areaSqm,
            priceAmd: editingApartment.priceAmd,
            status: editingApartment.status,
          }}
        />
      ) : null}
    </div>
  );
}
