'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import { loadCompanyProjects, type BuilderProjectRow } from '@/lib/builder/queries';
import { PROJECT_COMPLETENESS_KEYS } from '@/lib/projects/project-completeness';

import { NewProjectButton } from './new-project-button';
import { ProjectsTable } from './projects-table';

export function PortalProjectsClient() {
  const locale = useLocale();
  const t = useTranslations('portal.projects');
  const tStatus = useTranslations('portal.projects.status');
  const tCompleteness = useTranslations('completeness');
  const [projects, setProjects] = useState<BuilderProjectRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const builderContext = await assertBuilderSession();
      if (!builderContext || cancelled) {
        return;
      }
      const next = await loadCompanyProjects(builderContext.companyId);
      if (cancelled) {
        return;
      }
      setProjects(next);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!projects) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-[var(--te-muted)]" role="status">
        Loading…
      </div>
    );
  }

  const completenessLabels = {
    incomplete: tCompleteness('incomplete'),
    missingCount: (count: number) => tCompleteness('missingCount', { count }),
    items: Object.fromEntries(
      PROJECT_COMPLETENESS_KEYS.map((key) => [key, tCompleteness(`items.${key}`)]),
    ) as Record<(typeof PROJECT_COMPLETENESS_KEYS)[number], string>,
  };

  return (
    <section>
      <div className="portal-page__header">
        <h2 className="portal-page__title">{t('title')}</h2>
        <div className="portal-toolbar">
          <NewProjectButton locale={locale} label={t('newProject')} />
        </div>
      </div>

      {projects.length === 0 ? (
        <p className="portal-empty">{t('empty')}</p>
      ) : (
        <ProjectsTable
          locale={locale}
          projects={projects}
          labels={{
            noCity: t('noCity'),
            columns: {
              name: t('columns.name'),
              city: t('columns.city'),
              status: t('columns.status'),
              buildings: t('columns.buildings'),
              updatedAt: t('columns.updatedAt'),
              actions: t('columns.actions'),
            },
          }}
          statusLabels={{
            DRAFT: tStatus('DRAFT'),
            PUBLISHED: tStatus('PUBLISHED'),
            ARCHIVED: tStatus('ARCHIVED'),
          }}
          completenessLabels={completenessLabels}
        />
      )}
    </section>
  );
}
