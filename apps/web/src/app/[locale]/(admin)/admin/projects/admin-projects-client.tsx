'use client';

import type { PublicationStatus } from '@toonexpo/domain';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { loadAllProjects, type AdminProjectRow } from '@/lib/admin/queries';
import { parseProjectStatusFilter } from '@/lib/admin/project-status-filter';
import { PROJECT_COMPLETENESS_KEYS } from '@/lib/projects/project-completeness';

import { AdminProjectsTable } from './admin-projects-table';
import { ProjectStatusFilter } from './project-status-filter';

export function AdminProjectsClient() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const statusFilter = parseProjectStatusFilter(searchParams.get('status') ?? undefined);
  const t = useTranslations('admin.projects');
  const tStatus = useTranslations('admin.projects.status');
  const tCompleteness = useTranslations('completeness');
  const [projects, setProjects] = useState<AdminProjectRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setProjects(null);
    void (async () => {
      const next = await loadAllProjects(statusFilter);
      if (cancelled) {
        return;
      }
      setProjects(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [statusFilter]);

  if (!projects) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-[var(--te-muted)]" role="status">
        Loading…
      </div>
    );
  }

  const statusLabels: Record<PublicationStatus, string> = {
    DRAFT: tStatus('DRAFT'),
    PUBLISHED: tStatus('PUBLISHED'),
    ARCHIVED: tStatus('ARCHIVED'),
  };

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
        <ProjectStatusFilter
          currentStatus={statusFilter}
          labels={{
            all: t('filter.all'),
            ariaLabel: t('filter.ariaLabel'),
            DRAFT: statusLabels.DRAFT,
            PUBLISHED: statusLabels.PUBLISHED,
            ARCHIVED: statusLabels.ARCHIVED,
          }}
        />
      </div>

      {projects.length === 0 ? (
        <p className="portal-empty">{t('empty')}</p>
      ) : (
        <AdminProjectsTable
          locale={locale}
          projects={projects}
          labels={{
            columns: {
              company: t('columns.company'),
              name: t('columns.name'),
              status: t('columns.status'),
              buildings: t('columns.buildings'),
              updatedAt: t('columns.updatedAt'),
              actions: t('columns.actions'),
            },
          }}
          statusLabels={statusLabels}
          completenessLabels={completenessLabels}
        />
      )}
    </section>
  );
}
