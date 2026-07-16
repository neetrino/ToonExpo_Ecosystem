import { slugSchema } from '@toonexpo/contracts';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { loadWebEnv } from '@/lib/env';
import { getPublishedPartnerBySlug } from '@/lib/partners/queries';
import { buildPartnerOrganizationJsonLd } from '@/lib/seo/json-ld';
import { JsonLdScript } from '@/lib/seo/json-ld-script';
import { buildPublicPageMetadata } from '@/lib/seo/metadata';

import { PartnerDetailView } from './partner-detail-view';

type PartnerDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: PartnerDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const parsedSlug = slugSchema.safeParse(slug);
  if (!parsedSlug.success) {
    return {};
  }

  const partner = await getPublishedPartnerBySlug(parsedSlug.data);
  if (!partner) {
    return {};
  }

  const { APP_URL } = loadWebEnv();
  const t = await getTranslations({ locale, namespace: 'catalog.partners' });

  return buildPublicPageMetadata({
    titleName: partner.name,
    titleContext: t(`types.${partner.type}`),
    description: partner.description,
    descriptionFallback: t('detail.seoFallback', { name: partner.name }),
    path: `/${locale}/partners/${partner.slug}`,
    appUrl: APP_URL,
    locale,
    imageUrl: partner.logoUrl,
  });
}

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
      <JsonLdScript
        data={buildPartnerOrganizationJsonLd(partner, locale, loadWebEnv().APP_URL)}
      />
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
