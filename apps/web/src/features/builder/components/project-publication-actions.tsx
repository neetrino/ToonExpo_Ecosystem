'use client';

import type { PortalProjectDetail } from '@toonexpo/contracts';
import { QrCode, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { catalogProjectsListHref } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { CatalogDraftDeleteButton } from '@/features/builder/components/catalog-draft-delete-button';
import { ProjectPriceOnRequestToggle } from '@/features/builder/components/project-price-on-request-toggle';
import { PublicationStatusSwitcher } from '@/features/builder/components/publication-status-switcher';
import { useIsCompanyAdmin } from '@/features/builder/hooks/use-company-profile';
import {
  useDeletePortalProjectMutation,
  useUpdatePortalProjectMutation,
  useUpdateProjectPublicationMutation,
} from '@/features/builder/hooks/use-portal-projects';
import { toCatalogPublicationStatus } from '@/features/catalog/utils/catalog-publication-status';
import { useRouter } from '@/i18n/navigation';
import { AdminDeleteModal } from '@/shared/ui/admin-delete-modal';
import { IconButton } from '@/shared/ui/icon-button';
import { Switch } from '@/shared/ui/switch';
import { useSuccessToast } from '@/shared/ui/use-success-toast';

type ProjectPublicationActionsProps = {
  project: PortalProjectDetail;
  qrLabel: string;
  onOpenQr: () => void;
};

const PROJECT_VERIFIED_SWITCH_ID = 'project-verified';
const TOOLBAR_QR_ICON_CLASS = 'size-5';

/**
 * Project header chrome: Draft/Published · Verified · Price on request · QR in one pill.
 */
export const ProjectPublicationActions = ({
  project,
  qrLabel,
  onOpenQr,
}: ProjectPublicationActionsProps) => {
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
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="inline-flex max-w-full flex-wrap items-center gap-x-3 gap-y-2 rounded-full bg-surface-elevated py-1.5 pl-1.5 pr-2 shadow-sm ring-1 ring-border">
          <PublicationStatusSwitcher
            value={project.publicationStatus}
            disabled={busy}
            onChange={(status) => {
              void changeStatus(status);
            }}
          />
          <ToolbarDivider />
          <label
            htmlFor={PROJECT_VERIFIED_SWITCH_ID}
            className="flex items-center gap-2 px-1 text-sm text-ink"
          >
            <span>{tVerified('label')}</span>
            <Switch
              id={PROJECT_VERIFIED_SWITCH_ID}
              size="sm"
              checked={project.verified}
              disabled={busy}
              aria-label={tVerified('label')}
              onCheckedChange={(verified) => {
                void changeVerified(verified);
              }}
            />
          </label>
          <ToolbarDivider />
          <ProjectPriceOnRequestToggle project={project} />
          <ToolbarDivider />
          <IconButton
            label={qrLabel}
            variant="soft"
            size="sm"
            className="shrink-0 rounded-[12px]"
            onClick={onOpenQr}
          >
            <QrCode className={TOOLBAR_QR_ICON_CLASS} aria-hidden />
          </IconButton>
        </div>
        {toCatalogPublicationStatus(project.publicationStatus) === 'draft' ? (
          <CatalogDraftDeleteButton
            label={t('detail.delete')}
            iconOnly={scope.mode === 'admin'}
            disabled={busy}
            onClick={() => {
              setConfirmDelete(true);
            }}
          />
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

const ToolbarDivider = () => <span className="hidden h-6 w-px shrink-0 bg-border sm:block" aria-hidden />;
