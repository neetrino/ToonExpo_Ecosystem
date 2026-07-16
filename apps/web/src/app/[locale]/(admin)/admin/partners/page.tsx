import type { PartnerType, PublicationStatus } from '@toonexpo/domain';
import { PARTNER_TYPES } from '@toonexpo/domain';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { loadAllPartners } from '@/lib/admin/queries';
import { parsePartnerTypeFilter } from '@/lib/admin/partner-type-filter';

import { NewPartnerButton } from './new-partner-button';
import { PartnerTypeFilter } from './partner-type-filter';
import { PartnersTable } from './partners-table';

type AdminPartnersPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
};

export default async function AdminPartnersPage({ params, searchParams }: AdminPartnersPageProps) {
  const { locale } = await params;
  const { type: rawType } = await searchParams;
  setRequestLocale(locale);

  const typeFilter = parsePartnerTypeFilter(rawType);

  const [t, tTypes, tStatus, partners] = await Promise.all([
    getTranslations('admin.partners'),
    getTranslations('admin.partners.types'),
    getTranslations('admin.partners.status'),
    loadAllPartners(typeFilter),
  ]);

  const typeLabels = Object.fromEntries(
    PARTNER_TYPES.map((type) => [type, tTypes(type)]),
  ) as Record<PartnerType, string>;

  const statusLabels: Record<PublicationStatus, string> = {
    DRAFT: tStatus('DRAFT'),
    PUBLISHED: tStatus('PUBLISHED'),
    ARCHIVED: tStatus('ARCHIVED'),
  };

  return (
    <section>
      <div className="portal-page__header">
        <h2 className="portal-page__title">{t('title')}</h2>
        <div className="portal-toolbar">
          <NewPartnerButton locale={locale} label={t('newPartner')} />
        </div>
      </div>

      <PartnerTypeFilter
        currentType={typeFilter}
        labels={{
          all: t('filter.all'),
          ariaLabel: t('filter.ariaLabel'),
          ...typeLabels,
        }}
      />

      {partners.length === 0 ? (
        <p className="portal-empty">{t('empty')}</p>
      ) : (
        <PartnersTable
          partners={partners}
          labels={{
            columns: {
              name: t('columns.name'),
              type: t('columns.type'),
              status: t('columns.status'),
              offers: t('columns.offers'),
              actions: t('columns.actions'),
            },
            open: t('open'),
          }}
          typeLabels={typeLabels}
          statusLabels={statusLabels}
        />
      )}
    </section>
  );
}
