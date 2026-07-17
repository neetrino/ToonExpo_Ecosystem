'use client';

import type { PublicCompanyProfile } from '@toonexpo/contracts';
import { PLATFORM_ROLES } from '@toonexpo/domain';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import {
  loadCompanyMembers,
  loadCompanyProfile,
  type BuilderCompanyMemberRow,
} from '@/lib/builder/company-queries';

import { CompanyProfileSection } from './company-profile-section';
import { CompanyTeamSection } from './company-team-section';

type CompanyPageData = {
  profile: PublicCompanyProfile | null;
  members: BuilderCompanyMemberRow[];
};

export function PortalCompanyClient() {
  const locale = useLocale();
  const t = useTranslations('portal.company');
  const tRoles = useTranslations('portal.company.roles');
  const [data, setData] = useState<CompanyPageData | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const builderContext = await assertBuilderSession();
      if (!builderContext || cancelled) {
        return;
      }
      const [profile, members] = await Promise.all([
        loadCompanyProfile(builderContext.companyId),
        loadCompanyMembers(builderContext.companyId),
      ]);
      if (cancelled) {
        return;
      }
      setData({ profile, members });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-[var(--te-muted)]" role="status">
        Loading…
      </div>
    );
  }

  if (!data.profile) {
    return (
      <section>
        <h2 className="portal-page__title">{t('title')}</h2>
        <p className="portal-empty">{t('profileMissing')}</p>
      </section>
    );
  }

  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });
  const roleLabels = Object.fromEntries(
    PLATFORM_ROLES.map((role) => [role, tRoles(role)]),
  ) as Record<(typeof PLATFORM_ROLES)[number], string>;

  return (
    <section>
      <div className="portal-page__header">
        <div>
          <h2 className="portal-page__title">{t('title')}</h2>
          <p className="portal-page__subtitle">{t('subtitle')}</p>
        </div>
      </div>

      <CompanyProfileSection
        locale={locale}
        profile={data.profile}
        labels={{
          title: t('profileTitle'),
          edit: t('editProfile'),
          description: t('fields.description'),
          phone: t('fields.phone'),
          email: t('fields.email'),
          website: t('fields.website'),
          location: t('fields.location'),
          noValue: t('noValue'),
        }}
      />

      <CompanyTeamSection
        members={data.members}
        labels={{
          title: t('teamTitle'),
          empty: t('teamEmpty'),
          columns: {
            name: t('columns.name'),
            email: t('columns.email'),
            role: t('columns.role'),
            joinedAt: t('columns.joinedAt'),
          },
          roles: roleLabels,
        }}
        formatDate={(date) => dateFormatter.format(date)}
      />
    </section>
  );
}
