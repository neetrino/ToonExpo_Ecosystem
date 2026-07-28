import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { DeveloperDetailContent } from '@/features/catalog/components/developer-detail-content';
import { DeveloperDetailHero } from '@/features/catalog/components/developer-detail-hero';
import { SiteFooter } from '@/features/catalog/components/site-footer';
import {
  getDeveloperProfile,
  listDeveloperSlugs,
} from '@/features/catalog/data/developer-profiles';

type DeveloperDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export const generateStaticParams = () => listDeveloperSlugs().map((slug) => ({ slug }));

export const generateMetadata = async ({ params }: DeveloperDetailPageProps): Promise<Metadata> => {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'Catalog.developersPage' });
  const profile = getDeveloperProfile(slug, locale);

  if (!profile) {
    return { title: t('notFoundTitle') };
  }

  return {
    title: t('metaTitle', { name: profile.name }),
    description: t('metaDescription', { name: profile.name }),
  };
};

/**
 * Standalone developer page — same partner/builder detail chrome.
 */
export default async function DeveloperDetailPage({ params }: DeveloperDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const profile = getDeveloperProfile(slug, locale);
  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-canvas">
      <main>
        <DeveloperDetailHero profile={profile} />
        <DeveloperDetailContent profile={profile} />
      </main>
      <SiteFooter />
    </div>
  );
}
