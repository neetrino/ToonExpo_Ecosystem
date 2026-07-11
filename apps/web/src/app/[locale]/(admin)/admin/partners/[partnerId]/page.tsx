import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { loadPartnerDetail } from '@/lib/admin/queries';

import { BankOffersSection } from './bank-offers-section';
import { PartnerDetailHeader } from './partner-detail-header';

type AdminPartnerDetailPageProps = {
  params: Promise<{ locale: string; partnerId: string }>;
};

export default async function AdminPartnerDetailPage({ params }: AdminPartnerDetailPageProps) {
  const { locale, partnerId } = await params;
  setRequestLocale(locale);

  const partner = await loadPartnerDetail(partnerId);
  if (!partner) {
    notFound();
  }

  const [t, tTypes, tStatus] = await Promise.all([
    getTranslations('admin.partners'),
    getTranslations('admin.partners.types'),
    getTranslations('admin.partners.status'),
  ]);

  return (
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
  );
}
