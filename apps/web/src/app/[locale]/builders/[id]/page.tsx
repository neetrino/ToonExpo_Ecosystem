import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache } from 'react';

import { getBuilder } from '@/features/catalog/api/catalog-api';
import { BuilderDetailContent } from '@/features/catalog/components/builder-detail-content';
import { BuilderDetailHero } from '@/features/catalog/components/builder-detail-hero';
import { SiteFooter } from '@/features/catalog/components/site-footer';

type BuilderDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

const loadBuilder = cache((id: string, locale: string) => getBuilder(id, { locale }));

export const generateMetadata = async ({ params }: BuilderDetailPageProps): Promise<Metadata> => {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'Catalog' });
  const builder = await loadBuilder(id, locale);

  if (!builder) {
    return { title: t('buildersPage.notFoundTitle') };
  }

  return {
    title: t('buildersPage.detail.metaTitle', { name: builder.name }),
    description:
      builder.description ?? t('buildersPage.detail.metaDescription', { name: builder.name }),
  };
};

/**
 * Public builder detail — project-style cover with overlapping summary card.
 */
export default async function BuilderDetailPage({ params }: BuilderDetailPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const builder = await loadBuilder(id, locale);
  if (!builder) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-canvas">
      <main>
        <BuilderDetailHero builder={builder} />
        <BuilderDetailContent builder={builder} />
      </main>
      <SiteFooter />
    </div>
  );
}
