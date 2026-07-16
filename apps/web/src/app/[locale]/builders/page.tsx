import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getPublicBuilders } from '@/lib/builders/queries';

import { BuilderCard } from './builder-card';

type BuildersPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function BuildersPage({ params }: BuildersPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('catalog.builders');
  const builders = await getPublicBuilders();

  return (
    <section className="catalog-page">
      <header className="catalog-page__header">
        <h1 className="catalog-page__title">{t('list.title')}</h1>
        <p className="catalog-page__subtitle">{t('list.subtitle')}</p>
      </header>

      {builders.length === 0 ? (
        <p className="catalog-empty">{t('list.empty')}</p>
      ) : (
        <div className="catalog-grid">
          {builders.map((builder) => (
            <BuilderCard
              key={builder.id}
              builder={builder}
              projectCountLabel={t('list.projectCount', {
                count: builder.publishedProjectCount,
              })}
            />
          ))}
        </div>
      )}
    </section>
  );
}
