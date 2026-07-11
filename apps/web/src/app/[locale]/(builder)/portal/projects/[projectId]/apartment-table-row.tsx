'use client';

import type { ApartmentStatus } from '@toonexpo/domain';

import type { BuilderProjectApartment } from '@/lib/builder/queries';

type ApartmentRowLabels = {
  noValue: string;
  edit: string;
};

type ApartmentTableRowProps = {
  apartment: BuilderProjectApartment;
  labels: ApartmentRowLabels;
  statusLabels: Record<ApartmentStatus, string>;
  formatPrice: (value: number) => string;
  onEdit: (apartment: BuilderProjectApartment) => void;
};

export function ApartmentTableRow({
  apartment,
  labels,
  statusLabels,
  formatPrice,
  onEdit,
}: ApartmentTableRowProps) {
  return (
    <tr>
      <td>{apartment.code}</td>
      <td>{apartment.rooms ?? labels.noValue}</td>
      <td>{apartment.areaSqm ?? labels.noValue}</td>
      <td>{apartment.priceAmd != null ? formatPrice(apartment.priceAmd) : labels.noValue}</td>
      <td>
        <span className={`portal-apartment-status portal-apartment-status--${apartment.status}`}>
          {statusLabels[apartment.status]}
        </span>
      </td>
      <td>
        <button
          type="button"
          className="portal-btn portal-btn--ghost portal-btn--sm"
          onClick={() => onEdit(apartment)}
        >
          {labels.edit}
        </button>
      </td>
    </tr>
  );
}
