'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { DataRefreshProvider } from '@/components/portal-forms/data-refresh-context';
import {
  assertPartnerSession,
  type PartnerSessionPartner,
} from '@/lib/partner/assert-partner-session';

import { PartnerProfileSection } from './partner-profile-section';

export function PartnerProfileClient() {
  const locale = useLocale();
  const t = useTranslations('partnerCabinet.profile');
  const [partner, setPartner] = useState<PartnerSessionPartner | null>(null);
  const [ready, setReady] = useState(false);

  const loadProfile = useCallback(async () => {
    const ctx = await assertPartnerSession();
    setPartner(ctx?.partner ?? null);
    setReady(true);
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-[var(--te-muted)]" role="status">
        Loading…
      </div>
    );
  }

  if (!partner) {
    return null;
  }

  return (
    <DataRefreshProvider refresh={loadProfile}>
      <section>
        <div className="portal-page__header">
          <div>
            <h2 className="portal-page__title">{t('title')}</h2>
            <p className="portal-page__subtitle">{t('subtitle')}</p>
          </div>
        </div>

        <PartnerProfileSection
          locale={locale}
          partner={partner}
          labels={{
            title: t('sectionTitle'),
            edit: t('edit'),
            description: t('fields.description'),
            phone: t('fields.phone'),
            email: t('fields.email'),
            website: t('fields.website'),
            serviceCategories: t('fields.serviceCategories'),
            noValue: t('noValue'),
          }}
        />
      </section>
    </DataRefreshProvider>
  );
}
