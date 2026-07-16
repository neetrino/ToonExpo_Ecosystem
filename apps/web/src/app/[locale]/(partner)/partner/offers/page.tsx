import { redirect } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { assertPartnerSession } from '@/lib/partner/assert-partner-session';
import { loadOwnPartnerDetail } from '@/lib/partner/queries';

import { PartnerBankOffersSection } from './bank-offers-section';

type PartnerOffersPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PartnerOffersPage({ params }: PartnerOffersPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const ctx = await assertPartnerSession();
  if (!ctx) {
    return null;
  }

  if (ctx.partner.type !== 'BANK') {
    return redirect({ href: '/partner', locale });
  }

  const [t, tStatus, detail] = await Promise.all([
    getTranslations('partnerCabinet.offers'),
    getTranslations('partnerCabinet.status'),
    loadOwnPartnerDetail(ctx.partnerId),
  ]);

  const offers = detail?.bankOffers ?? [];

  return (
    <section>
      <div className="portal-page__header">
        <div>
          <h2 className="portal-page__title">{t('title')}</h2>
          <p className="portal-page__subtitle">{t('subtitle')}</p>
        </div>
      </div>

      <PartnerBankOffersSection
        locale={locale}
        offers={offers}
        labels={{
          title: t('sectionTitle'),
          empty: t('empty'),
          newOffer: t('newOffer'),
          edit: t('edit'),
          featured: t('featured'),
          columns: {
            title: t('columns.title'),
            rate: t('columns.rate'),
            term: t('columns.term'),
            amount: t('columns.amount'),
            status: t('columns.status'),
            actions: t('columns.actions'),
          },
          status: {
            DRAFT: tStatus('DRAFT'),
            PUBLISHED: tStatus('PUBLISHED'),
            ARCHIVED: tStatus('ARCHIVED'),
          },
        }}
      />
    </section>
  );
}
