'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { BuilderProjectDetail } from '@/lib/builder/queries';

import { STATUS_BADGE_CLASS } from '@/lib/shared/publication';
import { ProjectFormSheet } from '../sheets/project-form-sheet';

type ProjectHeaderProps = {
  locale: string;
  project: BuilderProjectDetail;
  statusLabel: string;
};

export function ProjectHeader({ locale, project, statusLabel }: ProjectHeaderProps) {
  const t = useTranslations('portal.projectDetail');
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <header className="portal-page__header">
        <div className="portal-page__heading">
          <h2 className="portal-page__title">{project.name}</h2>
          <span className={STATUS_BADGE_CLASS[project.status]}>{statusLabel}</span>
        </div>
        <button
          type="button"
          className="portal-btn portal-btn--ghost"
          onClick={() => setEditOpen(true)}
        >
          {t('editProject')}
        </button>
      </header>

      <ProjectFormSheet
        locale={locale}
        mode="edit"
        open={editOpen}
        onClose={() => setEditOpen(false)}
        values={{
          projectId: project.id,
          name: project.name,
          city: project.city,
          address: project.address,
          description: project.description,
        }}
      />
    </>
  );
}
