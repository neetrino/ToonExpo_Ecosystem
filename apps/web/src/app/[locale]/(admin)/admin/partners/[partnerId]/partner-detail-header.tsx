'use client';

import { useState } from 'react';

import type { AdminPartnerDetail } from '@/lib/admin/queries';

import { PartnerStatusButton } from '../partner-status-buttons';
import { PartnerFormSheet } from '../sheets/partner-form-sheet';

type PartnerDetailHeaderProps = {
  locale: string;
  partner: AdminPartnerDetail;
  labels: {
    edit: string;
    type: string;
    status: string;
    typeLabel: string;
    statusLabel: string;
  };
};

export function PartnerDetailHeader({ locale, partner, labels }: PartnerDetailHeaderProps) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="portal-page__header">
      <div>
        <h2 className="portal-page__title">{partner.name}</h2>
        <p className="portal-muted">
          {labels.type}: {labels.typeLabel} · {labels.status}:{' '}
          <span className={`portal-badge portal-badge--${partner.status.toLowerCase()}`}>
            {labels.statusLabel}
          </span>
        </p>
      </div>
      <div className="portal-toolbar">
        <button
          type="button"
          className="portal-btn portal-btn--primary"
          onClick={() => setEditOpen(true)}
        >
          {labels.edit}
        </button>
        {partner.status !== 'PUBLISHED' ? (
          <PartnerStatusButton
            locale={locale}
            partnerId={partner.id}
            targetStatus="PUBLISHED"
            actionKey="publish"
          />
        ) : null}
        {partner.status !== 'ARCHIVED' ? (
          <PartnerStatusButton
            locale={locale}
            partnerId={partner.id}
            targetStatus="ARCHIVED"
            actionKey="archive"
          />
        ) : null}
        {partner.status !== 'DRAFT' ? (
          <PartnerStatusButton
            locale={locale}
            partnerId={partner.id}
            targetStatus="DRAFT"
            actionKey="draft"
          />
        ) : null}
      </div>
      <PartnerFormSheet
        locale={locale}
        mode="edit"
        open={editOpen}
        onClose={() => setEditOpen(false)}
        values={{
          partnerId: partner.id,
          name: partner.name,
          type: partner.type,
          slug: partner.slug,
          logoUrl: partner.logoUrl,
          description: partner.description,
          phone: partner.phone,
          email: partner.email,
          website: partner.website,
          serviceCategories: partner.serviceCategories,
        }}
      />
    </div>
  );
}
