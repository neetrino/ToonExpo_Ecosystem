import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache } from 'react';

import { getPublicPartnerBySlug } from '@/features/catalog/api/partners-api';
import { PartnerDetailContent } from '@/features/catalog/components/partner-detail-content';
import { PartnerDetailHero } from '@/features/catalog/components/partner-detail-hero';
import { SiteFooter } from '@/features/catalog/components/site-footer';

type PartnerDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

const loadPartner = cache(async (slug: string, locale: string) => {
  try {
    return await getPublicPartnerBySlug(slug, { locale });
  } catch {
    return null;
  }
});

export const generateMetadata = async ({ params }: PartnerDetailPageProps): Promise<Metadata> => {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'Catalog' });
  const partner = await loadPartner(slug, locale);

  if (!partner) {
    return { title: t('partnersPage.notFoundTitle') };
  }

  return {
    title: partner.name,
    description: partner.shortDescription ?? t('partnersPage.metaFallback', { name: partner.name }),
  };
};

/**
 * Public partner detail — project-detail hero chrome with card media.
 */
export default async function PartnerDetailPage({ params }: PartnerDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const partner = await loadPartner(slug, locale);
  if (!partner) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-canvas">
      <main>
        <PartnerDetailHero partner={partner} />
        <PartnerDetailContent partner={partner} />
      </main>
      <SiteFooter />
    </div>
  );
}
