import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getPublicBuilders } from '@/lib/builders/queries';
import { getPublishedProjects } from '@/lib/catalog/queries';
import { parseProjectFilters } from '@/lib/catalog/project-filters';

import { ProjectCard } from './project-card';
import { ProjectFiltersForm } from './project-filters-form';

type ProjectsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ city?: string; builder?: string }>;
};

export default async function ProjectsPage({ params, searchParams }: ProjectsPageProps) {
  const { locale } = await params;
  const rawSearchParams = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('catalog');
  const filters = parseProjectFilters(rawSearchParams);
  const [projects, builders] = await Promise.all([
    getPublishedProjects(filters),
    getPublicBuilders(),
  ]);

  return (
    <section className="catalog-page">
      <header className="catalog-page__header">
        <h1 className="catalog-page__title">{t('list.title')}</h1>
        <p className="catalog-page__subtitle">{t('list.subtitle')}</p>
        <ProjectFiltersForm
          builders={builders}
          currentCity={filters.city}
          currentBuilderSlug={filters.builderSlug}
          labels={{
            city: t('list.filter.city'),
            cityPlaceholder: t('list.filter.cityPlaceholder'),
            builder: t('list.filter.builder'),
            builderAll: t('list.filter.builderAll'),
            apply: t('list.filter.apply'),
            clear: t('list.filter.clear'),
            ariaLabel: t('list.filter.ariaLabel'),
          }}
        />
      </header>

      {projects.length === 0 ? (
        <p className="catalog-empty">
          {filters.hasActiveFilters ? t('list.emptyFiltered') : t('list.empty')}
        </p>
      ) : (
        <div className="catalog-grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}
