'use client';

import { useState } from 'react';

import type { PublicCompanyProfile } from '@toonexpo/contracts';

import { CompanyProfileFormSheet } from './sheets/company-profile-form-sheet';

type CompanyProfileSectionProps = {
  locale: string;
  profile: PublicCompanyProfile;
  labels: {
    title: string;
    edit: string;
    description: string;
    phone: string;
    email: string;
    website: string;
    location: string;
    noValue: string;
  };
};

function CompanyLogo({ profile }: { profile: PublicCompanyProfile }) {
  if (profile.logoUrl) {
    return <img src={profile.logoUrl} alt="" className="portal-company-profile__logo" />;
  }

  const initial = profile.name.trim().charAt(0).toUpperCase() || '?';
  return (
    <div className="portal-company-profile__logo-fallback" aria-hidden="true">
      {initial}
    </div>
  );
}

export function CompanyProfileSection({ locale, profile, labels }: CompanyProfileSectionProps) {
  const [editOpen, setEditOpen] = useState(false);
  const location = [profile.city, profile.address].filter(Boolean).join(' · ');

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
        <CompanyLogo profile={profile} />
        <div className="portal-company-profile__body">
          <h4 className="portal-company-profile__name">{profile.name}</h4>
          <p className="portal-company-profile__slug">
            <code className="portal-code">{profile.slug}</code>
          </p>
          <dl className="portal-company-profile__facts">
            <div>
              <dt>{labels.description}</dt>
              <dd>{profile.description ?? labels.noValue}</dd>
            </div>
            <div>
              <dt>{labels.phone}</dt>
              <dd>{profile.phone ?? labels.noValue}</dd>
            </div>
            <div>
              <dt>{labels.email}</dt>
              <dd>{profile.email ?? labels.noValue}</dd>
            </div>
            <div>
              <dt>{labels.website}</dt>
              <dd>{profile.website ?? labels.noValue}</dd>
            </div>
            <div>
              <dt>{labels.location}</dt>
              <dd>{location || labels.noValue}</dd>
            </div>
          </dl>
        </div>
      </div>

      <CompanyProfileFormSheet
        locale={locale}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        profile={profile}
      />
    </section>
  );
}
