'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { AdminCreateProjectSheet } from '@/features/admin/components/admin-create-project-sheet';
import { CreateProjectSheet } from '@/features/builder/components/create-project-sheet';
import { Link, useRouter } from '@/i18n/navigation';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';

import { interactiveMappingProjectsQueryKey } from '../constants';
import { useInteractiveMappingProjectsQuery } from '../hooks/use-interactive-mapping';
import { useInteractiveMappingScope } from '../scope/interactive-mapping-scope';
import { InteractiveMappingProjectCard } from './interactive-mapping-project-card';

/**
 * Interactive-mapping project list with phase progress (Admin or Builder).
 */
export const InteractiveMappingProjectsPage = () => {
  const t = useTranslations('Admin.interactiveMapping');
  const { basePath, mode, showLabLink } = useInteractiveMappingScope();
  const projectsQuery = useInteractiveMappingProjectsQuery();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);

  const handleProjectCreated = (projectId: string) => {
    void queryClient.invalidateQueries({
      queryKey: interactiveMappingProjectsQueryKey(mode),
    });
    router.push(`${basePath}/${projectId}`);
  };

  if (projectsQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('title')}</h1>
          <p className="mt-1 text-sm text-ink-secondary">{t('subtitle')}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="shrink-0"
          onClick={() => {
            setCreateOpen(true);
          }}
        >
          <AddActionLabel>{t('createProject')}</AddActionLabel>
        </Button>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t('empty')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <InteractiveMappingProjectCard
              key={project.id}
              project={project}
              href={`${basePath}/${project.id}`}
            />
          ))}
        </div>
      )}

      {showLabLink ? (
        <p className="text-xs text-ink-muted">
          <Link href={`${basePath}/lab`} className="underline-offset-4 hover:underline">
            {t('labLink')}
          </Link>
        </p>
      ) : null}

      {mode === 'admin' ? (
        <AdminCreateProjectSheet
          open={createOpen}
          onClose={() => {
            setCreateOpen(false);
          }}
          onCreated={handleProjectCreated}
        />
      ) : (
        <CreateProjectSheet
          open={createOpen}
          onClose={() => {
            setCreateOpen(false);
          }}
          onCreated={handleProjectCreated}
        />
      )}
    </div>
  );
};
