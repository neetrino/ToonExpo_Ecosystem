'use client';

import type { PartnerType, PublicationStatus } from '@toonexpo/domain';

import { Link } from '@/i18n/navigation';
import type { AdminPartnerRow } from '@/lib/admin/queries';

type PartnersTableProps = {
  partners: AdminPartnerRow[];
  labels: {
    columns: {
      name: string;
      type: string;
      status: string;
      offers: string;
      actions: string;
    };
    open: string;
  };
  typeLabels: Record<PartnerType, string>;
  statusLabels: Record<PublicationStatus, string>;
};

export function PartnersTable({ partners, labels, typeLabels, statusLabels }: PartnersTableProps) {
  return (
    <div className="portal-table-wrap">
      <table className="portal-table">
        <thead>
          <tr>
            <th>{labels.columns.name}</th>
            <th>{labels.columns.type}</th>
            <th>{labels.columns.status}</th>
            <th>{labels.columns.offers}</th>
            <th>{labels.columns.actions}</th>
          </tr>
        </thead>
        <tbody>
          {partners.map((partner) => (
            <tr key={partner.id}>
              <td>{partner.name}</td>
              <td>
                <span className="portal-badge">{typeLabels[partner.type]}</span>
              </td>
              <td>
                <span className={`portal-badge portal-badge--${partner.status.toLowerCase()}`}>
                  {statusLabels[partner.status]}
                </span>
              </td>
              <td>{partner.offersCount}</td>
              <td>
                <Link
                  className="portal-btn portal-btn--ghost portal-btn--sm"
                  href={`/admin/partners/${partner.id}`}
                >
                  {labels.open}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
