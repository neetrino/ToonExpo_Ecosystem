import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { listBuilders } from '@/features/catalog/api/catalog-api';
import { BuilderCard } from '@/features/catalog/components/builder-card';
import { SiteFooter } from '@/features/catalog/components/site-footer';

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
  const builders = await listBuilders({ locale });

  return (
    <div className="min-h-screen bg-background">
      <main className="page-container section-pad">
        <header className="mb-8 flex flex-col gap-2">
          <h1 className="text-page-title text-ink">{t('buildersPage.title')}</h1>
          <p className="text-sm text-ink-secondary">
            {t('buildersPage.subtitle', { count: builders.length })}
          </p>
        </header>

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
