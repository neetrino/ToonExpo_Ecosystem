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
import { ConfirmDeleteModal } from '@/shared/ui/confirm-delete-modal';
import { useSuccessToast } from '@/shared/ui/use-success-toast';

type ProjectPublicationActionsProps = {
  project: PortalProjectDetail;
};

/**
 * Publish / archive / delete controls for platform admin or company_admin.
 */
export const ProjectPublicationActions = ({ project }: ProjectPublicationActionsProps) => {
  const scope = useCatalogScope();
  const t = useTranslations('Builder.projects');
  const router = useRouter();
  const isCompanyAdmin = useIsCompanyAdmin();
  const canManage = scope.mode === 'admin' || isCompanyAdmin;
  const publicationMutation = useUpdateProjectPublicationMutation(project.id);
  const deleteMutation = useDeletePortalProjectMutation();
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { showSuccess, successToast } = useSuccessToast();

  if (!canManage) {
    return null;
  }

  const busy = publicationMutation.isPending || deleteMutation.isPending;

  const changeStatus = async (publicationStatus: 'published' | 'archived') => {
    setError(null);
    try {
      await publicationMutation.mutateAsync({ publicationStatus });
      showSuccess(t('detail.publicationSuccess'));
    } catch {
      setError(t('errors.generic'));
    }
  };

  const onDelete = async () => {
    setError(null);
    try {
      await deleteMutation.mutateAsync(project.id);
      router.push(catalogProjectsListHref(scope));
    } catch {
      setError(t('errors.generic'));
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
              setConfirmOpen(true);
            }}
          >
            {t('detail.delete')}
          </Button>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      {successToast}
      <ConfirmDeleteModal
        open={confirmOpen}
        title={t('detail.deleteConfirmTitle')}
        message={t('detail.deleteConfirm')}
        confirming={deleteMutation.isPending}
        onCancel={() => {
          if (!deleteMutation.isPending) {
            setConfirmOpen(false);
          }
        }}
        onConfirm={() => {
          if (deleteMutation.isPending) {
            return;
          }
          void onDelete();
        }}
      />
    </div>
  );
};
