'use client';

import { useTranslations } from 'next-intl';

import { ProjectQrPanel } from '@/features/builder/components/project-qr-panel';
import { Card } from '@/shared/ui/card';

type ProjectQrSectionProps = {
  projectId: string;
  projectName: string;
};

/**
 * Exhibition Project QR card with copy-link action.
 */
export const ProjectQrSection = ({ projectId, projectName }: ProjectQrSectionProps) => {
  const t = useTranslations('Builder.projects.qr');

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-ink">{t('title')}</h2>
        <p className="text-sm text-ink-secondary">{t('subtitle')}</p>
      </div>
      <ProjectQrPanel projectId={projectId} projectName={projectName} />
    </Card>
  );
};
