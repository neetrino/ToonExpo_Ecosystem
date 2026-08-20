'use client';

import type { PortalProjectDetail } from '@toonexpo/contracts';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { catalogProjectsListHref } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { InventoryStatusControls } from '@/features/builder/components/inventory-status-controls';
import { useIsCompanyAdmin } from '@/features/builder/hooks/use-company-profile';
import {
  useDeletePortalProjectMutation,
  useUpdatePortalProjectMutation,
  useUpdateProjectPublicationMutation,
} from '@/features/builder/hooks/use-portal-projects';
import { useRouter } from '@/i18n/navigation';
import { AdminDeleteModal } from '@/shared/ui/admin-delete-modal';
import { Button } from '@/shared/ui/button';
import { useSuccessToast } from '@/shared/ui/use-success-toast';

type ProjectPublicationActionsProps = {
  project: PortalProjectDetail;
};

const PROJECT_VERIFIED_SWITCH_ID = 'project-verified';

/**
 * Draft / Published and Verified controls, plus delete for draft projects.
 */
export const ProjectPublicationActions = ({ project }: ProjectPublicationActionsProps) => {
  const scope = useCatalogScope();
  const t = useTranslations('Builder.projects');
  const tVerified = useTranslations('Builder.verified');
  const router = useRouter();
  const isCompanyAdmin = useIsCompanyAdmin();
  const canManage = scope.mode === 'admin' || isCompanyAdmin;
  const publicationMutation = useUpdateProjectPublicationMutation(project.id);
  const verifiedMutation = useUpdatePortalProjectMutation(project.id);
  const deleteMutation = useDeletePortalProjectMutation();
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { showSuccess, successToast } = useSuccessToast();
  const busy = publicationMutation.isPending || verifiedMutation.isPending || deleteMutation.isPending;

  const changeStatus = async (publicationStatus: 'published' | 'draft') => {
    setError(null);
    try {
      await publicationMutation.mutateAsync({ publicationStatus });
      showSuccess(t('detail.publicationSuccess'));
    } catch {
      setError(t('errors.generic'));
    }
  };

  const changeVerified = async (verified: boolean) => {
    setError(null);
    try {
      await verifiedMutation.mutateAsync({ verified });
      showSuccess(tVerified('saved'));
    } catch {
      setError(t('errors.generic'));
    }
  };

  const runDelete = (): void => {
    setError(null);
    void deleteMutation
      .mutateAsync(project.id)
      .then(() => {
        router.push(catalogProjectsListHref(scope));
      })
      .catch(() => {
        setError(t('errors.generic'));
      });
  };

  if (!canManage) {
    return null;
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <InventoryStatusControls
          publicationStatus={project.publicationStatus}
          verified={project.verified}
          verifiedSwitchId={PROJECT_VERIFIED_SWITCH_ID}
          busy={busy}
          onChangeStatus={(status) => {
            void changeStatus(status);
          }}
          onChangeVerified={(verified) => {
            void changeVerified(verified);
          }}
        />
        {project.publicationStatus === 'draft' ? (
          <Button
            type="button"
            size="sm"
            variant="danger"
            disabled={busy}
            onClick={() => {
              setConfirmDelete(true);
            }}
          >
            <Trash2 className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
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
      <AdminDeleteModal
        open={confirmDelete}
        title={t('detail.deleteConfirmTitle')}
        message={t('detail.deleteConfirm')}
        confirmLabel={t('detail.delete')}
        confirmVariant="danger"
        icon={<Trash2 className="size-5" strokeWidth={2} />}
        iconTone="danger"
        confirming={busy}
        onCancel={() => {
          if (!busy) {
            setConfirmDelete(false);
          }
        }}
        onConfirm={runDelete}
      />
    </div>
  );
};
