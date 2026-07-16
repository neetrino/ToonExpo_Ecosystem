import { getTranslations } from 'next-intl/server';

import { TeButton } from '@/components/ui/te-button';
import { getPublishedProjects } from '@/lib/catalog/queries';
import { HOME_NEWEST_PROJECTS_LIMIT } from '@/lib/home/constants';

import { ProjectCard } from './projects/project-card';

export async function HomeNewestProjects() {
  const t = await getTranslations('home');
  const projects = (await getPublishedProjects()).slice(0, HOME_NEWEST_PROJECTS_LIMIT);

  return (
    <section className="bg-[var(--te-bg-soft)] px-6 py-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--te-fg)]">
              {t('newestTitle')}
            </h2>
            <p className="max-w-2xl text-[var(--te-muted)]">{t('newestSubtitle')}</p>
          </div>
          <TeButton href="/projects" variant="secondary">
            {t('ctaViewAll')}
          </TeButton>
        </header>
        {projects.length === 0 ? (
          <p className="text-[var(--te-muted)]">{t('newestEmpty')}</p>
        ) : (
          <div className="catalog-grid">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} showNewBadge={index < 2} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
