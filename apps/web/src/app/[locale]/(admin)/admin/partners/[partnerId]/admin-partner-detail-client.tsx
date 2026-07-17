'use client';

import { notFound } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { DataRefreshProvider } from '@/components/portal-forms/data-refresh-context';
import { Link } from '@/i18n/navigation';
import { loadPartnerDetail, type AdminPartnerDetail } from '@/lib/admin/queries';

import { BankOffersSection } from './bank-offers-section';
import { PartnerDetailHeader } from './partner-detail-header';

type AdminPartnerDetailClientProps = {
  partnerId: string;
};

export function AdminPartnerDetailClient({ partnerId }: AdminPartnerDetailClientProps) {
  const locale = useLocale();
  const t = useTranslations('admin.partners');
  const tTypes = useTranslations('admin.partners.types');
  const tStatus = useTranslations('admin.partners.status');
  const [partner, setPartner] = useState<AdminPartnerDetail | null>(null);
  const [missing, setMissing] = useState(false);

  const loadPartner = useCallback(async () => {
    const next = await loadPartnerDetail(partnerId);
    if (!next) {
      setMissing(true);
      return;
    }
    setMissing(false);
    setPartner(next);
  }, [partnerId]);

  useEffect(() => {
    setPartner(null);
    setMissing(false);
    void loadPartner();
  }, [loadPartner]);

  if (missing) {
    notFound();
  }

  if (!partner) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-[var(--te-muted)]" role="status">
        Loading…
      </div>
    );
  }

  return (
    <DataRefreshProvider refresh={loadPartner}>
      <section>
        <p className="portal-breadcrumb">
          <Link href="/admin/partners">{t('backToList')}</Link>
        </p>

        <PartnerDetailHeader
          locale={locale}
          partner={partner}
          labels={{
            edit: t('edit'),
            type: t('columns.type'),
            status: t('columns.status'),
            typeLabel: tTypes(partner.type),
            statusLabel: tStatus(partner.status),
          }}
        />

        <dl className="portal-dl">
          <div>
            <dt>{t('form.fields.slug')}</dt>
            <dd>
              <code className="portal-code">{partner.slug}</code>
            </dd>
          </div>
          {partner.description ? (
            <div>
              <dt>{t('form.fields.description')}</dt>
              <dd>{partner.description}</dd>
            </div>
          ) : null}
          {partner.phone ? (
            <div>
              <dt>{t('form.fields.phone')}</dt>
              <dd>{partner.phone}</dd>
            </div>
          ) : null}
          {partner.email ? (
            <div>
              <dt>{t('form.fields.email')}</dt>
              <dd>{partner.email}</dd>
            </div>
          ) : null}
          {partner.website ? (
            <div>
              <dt>{t('form.fields.website')}</dt>
              <dd>{partner.website}</dd>
            </div>
          ) : null}
          {partner.serviceCategories.length > 0 ? (
            <div>
              <dt>{t('form.fields.serviceCategories')}</dt>
              <dd>{partner.serviceCategories.join(', ')}</dd>
            </div>
          ) : null}
        </dl>

        {partner.type === 'BANK' ? (
          <BankOffersSection
            locale={locale}
            partnerId={partner.id}
            offers={partner.bankOffers}
            labels={{
              title: t('offers.title'),
              empty: t('offers.empty'),
              newOffer: t('offers.newOffer'),
              edit: t('edit'),
              columns: {
                title: t('offers.columns.title'),
                rate: t('offers.columns.rate'),
                term: t('offers.columns.term'),
                amount: t('offers.columns.amount'),
                status: t('offers.columns.status'),
                actions: t('offers.columns.actions'),
              },
              status: {
                DRAFT: tStatus('DRAFT'),
                PUBLISHED: tStatus('PUBLISHED'),
                ARCHIVED: tStatus('ARCHIVED'),
              },
              featured: t('offers.featured'),
            }}
          />
        ) : null}
      </section>
    </DataRefreshProvider>
  );
}
