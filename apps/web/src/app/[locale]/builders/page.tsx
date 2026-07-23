import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { listBuilders } from '@/features/catalog/api/catalog-api';
import { BuilderCard } from '@/features/catalog/components/builder-card';
import { SiteFooter } from '@/features/catalog/components/site-footer';
import { MarketingPageIntro } from '@/shared/ui/marketing-page-intro';

type BuildersPageProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async ({ params }: BuildersPageProps): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Catalog' });

  return {
    title: t('buildersPage.meta.title'),
    description: t('buildersPage.meta.description'),
  };
};

export default async function BuildersPage({ params }: BuildersPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Catalog');
  /** Soft-fail when API is down during prerender (`next build` without Nest). */
  const builders = await listBuilders({ locale }).catch(() => []);

  return (
    <div className="min-h-screen bg-background">
      <main className="page-container section-pad">
        <MarketingPageIntro
          title={t('buildersPage.title')}
          description={t('buildersPage.subtitle', { count: builders.length })}
          imageSrc="/demo/building-a.webp"
        />

        {builders.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-surface/50 px-6 py-12 text-center text-sm text-ink-secondary">
            {t('buildersPage.empty')}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {builders.map((builder) => (
              <BuilderCard key={builder.id} builder={builder} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
