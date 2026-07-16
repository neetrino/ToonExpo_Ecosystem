import type { PartnerType } from '@toonexpo/domain';
import { PARTNER_TYPES } from '@toonexpo/domain';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getPublishedPartners } from '@/lib/partners/queries';
import { parsePartnerTypeFilter } from '@/lib/partners/partner-type-filter';

import { PartnerCard } from './partner-card';
import { PublicPartnerTypeFilter } from './partner-type-filter';

type PartnersPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
};

function buildTypeLabels(
  t: Awaited<ReturnType<typeof getTranslations<'catalog.partners'>>>,
): { all: string; ariaLabel: string } & Record<PartnerType, string> {
  const labels = {
    all: t('filter.all'),
    ariaLabel: t('filter.ariaLabel'),
  } as { all: string; ariaLabel: string } & Record<PartnerType, string>;

  for (const type of PARTNER_TYPES) {
    labels[type] = t(`types.${type}`);
  }

  return labels;
}

export default async function PartnersPage({ params, searchParams }: PartnersPageProps) {
  const { locale } = await params;
  const { type } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('catalog.partners');
  const currentType = parsePartnerTypeFilter(type);
  const partners = await getPublishedPartners(type);
  const typeLabels = buildTypeLabels(t);

  return (
    <section className="catalog-page">
      <header className="catalog-page__header">
        <h1 className="catalog-page__title">{t('list.title')}</h1>
        <p className="catalog-page__subtitle">{t('list.subtitle')}</p>
        <PublicPartnerTypeFilter currentType={currentType} labels={typeLabels} />
      </header>

      {partners.length === 0 ? (
        <p className="catalog-empty">{t('list.empty')}</p>
      ) : (
        <div className="catalog-grid">
          {partners.map((partner) => (
            <PartnerCard
              key={partner.id}
              partner={partner}
              typeLabel={t(`types.${partner.type}`)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
