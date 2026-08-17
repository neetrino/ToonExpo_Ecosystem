'use client';

import type { PortalProjectDetail } from '@toonexpo/contracts';
import { Archive, Globe, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';

import { catalogProjectsListHref } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { useIsCompanyAdmin } from '@/features/builder/hooks/use-company-profile';
import {
  useDeletePortalProjectMutation,
  useUpdateProjectPublicationMutation,
} from '@/features/builder/hooks/use-portal-projects';
import { useRouter } from '@/i18n/navigation';
import { AdminDeleteModal } from '@/shared/ui/admin-delete-modal';
import { Button, type ButtonProps } from '@/shared/ui/button';
import { useSuccessToast } from '@/shared/ui/use-success-toast';

type ProjectPublicationActionsProps = {
  project: PortalProjectDetail;
};

type PendingAction = 'publish' | 'archive' | 'delete';

type ConfirmCopy = {
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant: NonNullable<ButtonProps['variant']>;
  icon: ReactNode;
  iconTone: 'danger' | 'brand' | 'neutral';
};

type TranslateDetail = ReturnType<typeof useTranslations<'Builder.projects'>>;

const buildConfirmCopy = (
  action: PendingAction,
  projectName: string,
  t: TranslateDetail,
): ConfirmCopy => {
  if (action === 'publish') {
    return {
      title: t('detail.publishConfirmTitle'),
      message: t('detail.publishConfirm', { name: projectName }),
      confirmLabel: t('detail.publish'),
      confirmVariant: 'secondary',
      icon: <Globe className="size-5" strokeWidth={2} />,
      iconTone: 'brand',
    };
  }
  if (action === 'archive') {
    return {
      title: t('detail.archiveConfirmTitle'),
      message: t('detail.archiveConfirm', { name: projectName }),
      confirmLabel: t('detail.archive'),
      confirmVariant: 'ghost',
      icon: <Archive className="size-5" strokeWidth={2} />,
      iconTone: 'neutral',
    };
  }
  return {
    title: t('detail.deleteConfirmTitle'),
    message: t('detail.deleteConfirm'),
    confirmLabel: t('detail.delete'),
    confirmVariant: 'danger',
    icon: <Trash2 className="size-5" strokeWidth={2} />,
    iconTone: 'danger',
  };
};

type ActionButtonsProps = {
  publicationStatus: PortalProjectDetail['publicationStatus'];
  busy: boolean;
  onRequest: (action: PendingAction) => void;
  publishLabel: string;
  archiveLabel: string;
  deleteLabel: string;
};

const ActionButtons = ({
  publicationStatus,
  busy,
  onRequest,
  publishLabel,
  archiveLabel,
  deleteLabel,
}: ActionButtonsProps) => (
  <div className="flex flex-wrap items-center gap-2">
    {publicationStatus !== 'published' ? (
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={busy}
        className="min-w-28 shadow-sm"
        onClick={() => {
          onRequest('publish');
        }}
      >
        <Globe className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
        {publishLabel}
      </Button>
    ) : null}
    {publicationStatus !== 'archived' ? (
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={busy}
        onClick={() => {
          onRequest('archive');
        }}
      >
        <Archive className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
        {archiveLabel}
      </Button>
    ) : null}
    {publicationStatus === 'draft' ? (
      <Button
        type="button"
        size="sm"
        variant="danger"
        disabled={busy}
        onClick={() => {
          onRequest('delete');
        }}
      >
        <Trash2 className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
        {deleteLabel}
      </Button>
    ) : null}
  </div>
);

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
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const { showSuccess, successToast } = useSuccessToast();

  if (!canManage) {
    return null;
  }

  const busy = publicationMutation.isPending || deleteMutation.isPending;
  const modal = pendingAction ? buildConfirmCopy(pendingAction, project.name, t) : null;

  const closeConfirm = (): void => {
    if (!busy) {
      setPendingAction(null);
    }
  };

  const runPendingAction = (): void => {
    if (!pendingAction || busy) {
      return;
    }
    setError(null);
    if (pendingAction === 'delete') {
      void deleteMutation
        .mutateAsync(project.id)
        .then(() => {
          router.push(catalogProjectsListHref(scope));
        })
        .catch(() => {
          setError(t('errors.generic'));
        });
      return;
    }
    const nextStatus = pendingAction === 'publish' ? 'published' : 'archived';
    void publicationMutation
      .mutateAsync({ publicationStatus: nextStatus })
      .then(() => {
        showSuccess(t('detail.publicationSuccess'));
        setPendingAction(null);
      })
      .catch(() => {
        setError(t('errors.generic'));
      });
  };

  return (
    <div className="flex flex-col gap-2">
      <ActionButtons
        publicationStatus={project.publicationStatus}
        busy={busy}
        onRequest={setPendingAction}
        publishLabel={t('detail.publish')}
        archiveLabel={t('detail.archive')}
        deleteLabel={t('detail.delete')}
      />
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      {successToast}
      <AdminDeleteModal
        open={pendingAction !== null}
        title={modal?.title ?? ''}
        message={modal?.message ?? ''}
        confirmLabel={modal?.confirmLabel}
        confirmVariant={modal?.confirmVariant ?? 'danger'}
        icon={modal?.icon}
        iconTone={modal?.iconTone ?? 'danger'}
        confirming={busy}
        onCancel={closeConfirm}
        onConfirm={runPendingAction}
      />
    </div>
  );
};
