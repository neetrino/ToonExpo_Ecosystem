'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

import { INTERACTIVE_MAPPING_BASE_PATH } from '../constants';
import { useInteractiveMappingProjectsQuery } from '../hooks/use-interactive-mapping';

/**
 * Admin interactive-mapping project list with phase progress.
 */
export const InteractiveMappingProjectsPage = () => {
  const t = useTranslations('Admin.interactiveMapping');
  const projectsQuery = useInteractiveMappingProjectsQuery();

  if (projectsQuery.isLoading) {
    return <p className="text-sm text-ink-muted">{t('loading')}</p>;
  }

  if (projectsQuery.isError) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  const projects = projectsQuery.data?.data ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-ink">{t('title')}</h1>
          <p className="mt-2 text-sm text-ink-muted">{t('subtitle')}</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="rounded-sm border border-ink bg-ink px-4 py-3 text-xs uppercase tracking-[0.16em] text-on-dark"
        >
          {t('createProject')}
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">{t('existing')}</h2>
        {projects.length === 0 ? (
          <p className="rounded-sm border border-dashed border-border bg-background px-4 py-6 text-sm text-ink-muted">
            {t('empty')}
          </p>
        ) : (
          <ul className="space-y-2">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`${INTERACTIVE_MAPPING_BASE_PATH}/${project.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border bg-background px-4 py-4 transition hover:border-border-strong"
                >
                  <div>
                    <p className="font-display text-xl text-ink">{project.name}</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {t('projectMeta', {
                        districts: project.districtCount,
                        buildings: project.buildingCount,
                        phase: project.activePhase ?? 0,
                      })}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.14em] text-ink">
                    {project.activePhase
                      ? t('continuePhase', { phase: project.activePhase })
                      : t('open')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs text-ink-muted">
        <Link
          href={`${INTERACTIVE_MAPPING_BASE_PATH}/lab`}
          className="underline-offset-4 hover:underline"
        >
          {t('labLink')}
        </Link>
      </p>
    </div>
  );
};
