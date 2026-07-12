import { getTranslations, setRequestLocale } from 'next-intl/server';

import { assertPartnerSession } from '@/lib/partner/assert-partner-session';

import { PartnerProfileSection } from './partner-profile-section';

type PartnerProfilePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PartnerProfilePage({ params }: PartnerProfilePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const ctx = await assertPartnerSession();
  if (!ctx) {
    return null;
  }

  const t = await getTranslations('partnerCabinet.profile');

  return (
    <section>
      <div className="portal-page__header">
        <div>
          <h2 className="portal-page__title">{t('title')}</h2>
          <p className="portal-page__subtitle">{t('subtitle')}</p>
        </div>
      </div>

      <PartnerProfileSection
        locale={locale}
        partner={ctx.partner}
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
  );
}
