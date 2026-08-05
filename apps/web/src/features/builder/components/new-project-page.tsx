'use client';

import { catalogProjectsListHref } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { useTranslations } from 'next-intl';

import { CreateProjectForm } from '@/features/builder/components/create-project-form';
import { BackLink } from '@/shared/ui/back-link';
import { Card } from '@/shared/ui/card';

/**
 * New project page shell.
 */
export const NewProjectPage = () => {
  const scope = useCatalogScope();
  const t = useTranslations('Builder.projects');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <BackLink href={catalogProjectsListHref(scope)} label={t('detail.back')} />
        <h1 className="text-page-title text-ink">{t('new.title')}</h1>
        <p className="text-sm text-ink-secondary">{t('new.subtitle')}</p>
      </div>
      <Card>
        <CreateProjectForm />
      </Card>
    </div>
  );
};
