'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ProjectCompletenessBadge } from '@/components/project-completeness-badge';
import type { BuilderProjectDetail } from '@/lib/builder/queries';
import {
  PROJECT_COMPLETENESS_KEYS,
  type ProjectCompletenessKey,
} from '@/lib/projects/project-completeness';

import { STATUS_BADGE_CLASS } from '@/lib/shared/publication';
import { ProjectFormSheet } from '../sheets/project-form-sheet';

type ProjectHeaderProps = {
  locale: string;
  project: BuilderProjectDetail;
  statusLabel: string;
  completenessMissingKeys: ProjectCompletenessKey[];
};

export function ProjectHeader({
  locale,
  project,
  statusLabel,
  completenessMissingKeys,
}: ProjectHeaderProps) {
  const t = useTranslations('portal.projectDetail');
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <header className="portal-page__header">
        <div className="portal-page__heading">
          <h2 className="portal-page__title">{project.name}</h2>
          <span className={STATUS_BADGE_CLASS[project.status]}>{statusLabel}</span>
          <ProjectCompletenessLabels missingKeys={completenessMissingKeys} />
        </div>
        <button
          type="button"
          className="portal-btn portal-btn--ghost"
          onClick={() => setEditOpen(true)}
        >
          {t('editProject')}
        </button>
      </header>
      <CompletenessHint missingKeys={completenessMissingKeys} />
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

function ProjectCompletenessLabels({ missingKeys }: { missingKeys: ProjectCompletenessKey[] }) {
  const tCompleteness = useTranslations('completeness');

  return (
    <ProjectCompletenessBadge
      missingKeys={missingKeys}
      labels={{
        incomplete: tCompleteness('incomplete'),
        missingCount: (count) => tCompleteness('missingCount', { count }),
        items: Object.fromEntries(
          PROJECT_COMPLETENESS_KEYS.map((key) => [key, tCompleteness(`items.${key}`)]),
        ) as Record<ProjectCompletenessKey, string>,
      }}
    />
  );
}

function CompletenessHint({ missingKeys }: { missingKeys: ProjectCompletenessKey[] }) {
  const t = useTranslations('portal.projectDetail');
  const tCompleteness = useTranslations('completeness');

  if (missingKeys.length === 0) {
    return null;
  }

  return (
    <p className="portal-page__subtitle">
      {t('completenessHint', {
        items: missingKeys.map((key) => tCompleteness(`items.${key}`)).join(', '),
      })}
    </p>
  );
}
