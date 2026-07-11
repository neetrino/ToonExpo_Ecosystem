import { slugSchema } from '@toonexpo/contracts';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getPublishedPartnerBySlug } from '@/lib/partners/queries';

import { PartnerDetailView } from './partner-detail-view';

type PartnerDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function PartnerDetailPage({ params }: PartnerDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const parsedSlug = slugSchema.safeParse(slug);
  if (!parsedSlug.success) {
    notFound();
  }

  const partner = await getPublishedPartnerBySlug(parsedSlug.data);
  if (!partner) {
    notFound();
  }

  const t = await getTranslations('catalog.partners');

  return (
    <section className="catalog-page">
      <PartnerDetailView
        partner={partner}
        locale={locale}
        labels={{
          type: t(`types.${partner.type}`),
          contacts: t('detail.contacts'),
          phone: t('detail.phone'),
          email: t('detail.email'),
          website: t('detail.website'),
          serviceCategories: t('detail.serviceCategories'),
          bankOffers: t('detail.bankOffers'),
          featured: t('detail.featured'),
          interestRate: t('detail.interestRate'),
          maxTerm: t('detail.maxTermYears'),
          maxAmount: t('detail.maxAmount'),
          mortgageLink: t('detail.mortgageLink'),
          noValue: t('detail.noValue'),
        }}
      />
    </section>
  );
}
