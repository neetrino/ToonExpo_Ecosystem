'use client';

import { catalogProjectsListHref } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import type { PortalProjectDetail } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useIsCompanyAdmin } from '@/features/builder/hooks/use-company-profile';
import {
  useDeletePortalProjectMutation,
  useUpdateProjectPublicationMutation,
} from '@/features/builder/hooks/use-portal-projects';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';

type ProjectPublicationActionsProps = {
  project: PortalProjectDetail;
};

/**
 * Publish / archive / delete controls for company_admin.
 */
export const ProjectPublicationActions = ({ project }: ProjectPublicationActionsProps) => {
  const scope = useCatalogScope();
  const t = useTranslations('Builder.projects');
  const router = useRouter();
  const isAdmin = useIsCompanyAdmin();
  const publicationMutation = useUpdateProjectPublicationMutation(project.id);
  const deleteMutation = useDeletePortalProjectMutation();
  const [toast, setToast] = useState<'success' | 'error' | null>(null);

  if (!isAdmin) {
    return null;
  }

  const busy = publicationMutation.isPending || deleteMutation.isPending;

  const changeStatus = async (publicationStatus: 'published' | 'archived') => {
    setToast(null);
    try {
      await publicationMutation.mutateAsync({ publicationStatus });
      setToast('success');
    } catch {
      setToast('error');
    }
  };

  const onDelete = async () => {
    if (!window.confirm(t('detail.deleteConfirm'))) {
      return;
    }
    setToast(null);
    try {
      await deleteMutation.mutateAsync(project.id);
      router.push(catalogProjectsListHref(scope));
    } catch {
      setToast('error');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {project.publicationStatus !== 'published' ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => {
              void changeStatus('published');
            }}
          >
            {t('detail.publish')}
          </Button>
        ) : null}
        {project.publicationStatus !== 'archived' ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => {
              void changeStatus('archived');
            }}
          >
            {t('detail.archive')}
          </Button>
        ) : null}
        {project.publicationStatus === 'draft' ? (
          <Button
            type="button"
            size="sm"
            variant="danger"
            disabled={busy}
            onClick={() => {
              void onDelete();
            }}
          >
            {t('detail.delete')}
          </Button>
        ) : null}
      </div>
      {toast === 'success' ? (
        <p role="status" className="text-sm text-success">
          {t('detail.publicationSuccess')}
        </p>
      ) : null}
      {toast === 'error' ? (
        <p role="alert" className="text-sm text-danger">
          {t('errors.generic')}
        </p>
      ) : null}
    </div>
  );
};
