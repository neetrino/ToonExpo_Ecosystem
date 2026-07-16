'use client';

import { useState } from 'react';

import type { PartnerSessionPartner } from '@/lib/partner/assert-partner-session';

import { PartnerProfileFormSheet } from './sheets/partner-profile-form-sheet';

type PartnerProfileSectionProps = {
  locale: string;
  partner: PartnerSessionPartner;
  labels: {
    title: string;
    edit: string;
    description: string;
    phone: string;
    email: string;
    website: string;
    serviceCategories: string;
    noValue: string;
  };
};

function PartnerLogo({ partner }: { partner: PartnerSessionPartner }) {
  if (partner.logoUrl) {
    return <img src={partner.logoUrl} alt="" className="portal-company-profile__logo" />;
  }

  const initial = partner.name.trim().charAt(0).toUpperCase() || '?';
  return (
    <div className="portal-company-profile__logo-fallback" aria-hidden="true">
      {initial}
    </div>
  );
}

export function PartnerProfileSection({ locale, partner, labels }: PartnerProfileSectionProps) {
  const [editOpen, setEditOpen] = useState(false);
  const showServices = partner.type === 'SERVICE_COMPANY';

  return (
    <section className="portal-section">
      <div className="portal-page__header">
        <h3 className="portal-page__subtitle">{labels.title}</h3>
        <button
          type="button"
          className="portal-btn portal-btn--primary"
          onClick={() => setEditOpen(true)}
        >
          {labels.edit}
        </button>
      </div>

      <div className="portal-company-profile">
        <PartnerLogo partner={partner} />
        <div className="portal-company-profile__body">
          <h4 className="portal-company-profile__name">{partner.name}</h4>
          <p className="portal-company-profile__slug">
            <code className="portal-code">{partner.slug}</code>
          </p>
          <dl className="portal-company-profile__facts">
            <div>
              <dt>{labels.description}</dt>
              <dd>{partner.description ?? labels.noValue}</dd>
            </div>
            <div>
              <dt>{labels.phone}</dt>
              <dd>{partner.phone ?? labels.noValue}</dd>
            </div>
            <div>
              <dt>{labels.email}</dt>
              <dd>{partner.email ?? labels.noValue}</dd>
            </div>
            <div>
              <dt>{labels.website}</dt>
              <dd>{partner.website ?? labels.noValue}</dd>
            </div>
            {showServices ? (
              <div>
                <dt>{labels.serviceCategories}</dt>
                <dd>
                  {partner.serviceCategories.length > 0
                    ? partner.serviceCategories.join(', ')
                    : labels.noValue}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>

      <PartnerProfileFormSheet
        locale={locale}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        partner={partner}
      />
    </section>
  );
}
