import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { listBuilders } from '@/features/catalog/api/catalog-api';
import { BuilderCard } from '@/features/catalog/components/builder-card';
import { BuildersPageHero } from '@/features/catalog/components/builders-page-hero';
import { BuildersSearchForm } from '@/features/catalog/components/builders-search-form';
import { SiteFooter } from '@/features/catalog/components/site-footer';
import {
  matchesBuilderSearch,
  parseBuilderFilters,
} from '@/features/catalog/utils/builder-filters';

type BuildersPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const generateMetadata = async ({ params }: BuildersPageProps): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Catalog' });

  return {
    title: t('buildersPage.meta.title'),
    description: t('buildersPage.meta.description'),
  };
};

export default async function BuildersPage({ params, searchParams }: BuildersPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Catalog');
  const filters = parseBuilderFilters(await searchParams);
  /** Soft-fail when API is down during prerender (`next build` without Nest). */
  const builders = await listBuilders({ locale }).catch(() => []);
  const filteredBuilders = builders.filter((builder) =>
    matchesBuilderSearch(filters.q, [builder.name, builder.description ?? '']),
  );

  return (
    <div className="min-h-screen bg-canvas">
      <main>
        <BuildersPageHero
          title={t('buildersPage.title')}
          description={t('buildersPage.subtitle', { count: builders.length })}
        />

        <div className="page-container section-pad pt-8 sm:pt-10">
          <BuildersSearchForm filters={filters} />

          {filteredBuilders.length === 0 ? (
            <p className="mt-10 rounded-[20px] border border-dashed border-header-border bg-surface-elevated px-6 py-12 text-center text-sm text-header-muted">
              {filters.q ? t('buildersPage.search.empty') : t('buildersPage.empty')}
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBuilders.map((builder) => (
                <BuilderCard key={builder.id} builder={builder} />
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
