'use client';

import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { CompanyProjectsSection } from '@/features/admin/components/company-projects-section';
import { EditCompanyForm } from '@/features/admin/components/edit-company-form';
import { ResendInviteButton } from '@/features/admin/components/resend-invite-button';
import {
  useAdminCompanyQuery,
  useDeleteAdminCompanyMutation,
} from '@/features/admin/hooks/use-admin-companies';
import { isApiErrorStatus } from '@/shared/api/errors';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { ConfirmDeleteModal } from '@/shared/ui/confirm-delete-modal';
import { IconButton } from '@/shared/ui/icon-button';

type CompanyDetailSheetProps = {
  companyId: string | null;
  open: boolean;
  onClose: () => void;
};

type DeleteErrorKey = 'blocked' | 'generic';

/**
 * Right-side sheet with company edit form, projects, invite resend, and delete.
 */
export const CompanyDetailSheet = ({ companyId, open, onClose }: CompanyDetailSheetProps) => {
  const t = useTranslations('Admin.companies');
  const tCommon = useTranslations('Common');
  const query = useAdminCompanyQuery(companyId ?? '');
  const deleteMutation = useDeleteAdminCompanyMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<DeleteErrorKey | null>(null);

  const company = query.data;
  const title = company?.name ?? t('detail.sheetTitle');
  const deleting = deleteMutation.isPending;

  const onConfirmDelete = (): void => {
    if (!companyId || deleting) {
      return;
    }
    setDeleteError(null);
    void deleteMutation
      .mutateAsync(companyId)
      .then(() => {
        setConfirmOpen(false);
        onClose();
      })
      .catch((error: unknown) => {
        setConfirmOpen(false);
        setDeleteError(isApiErrorStatus(error, 409) ? 'blocked' : 'generic');
      });
  };

  return (
    <>
      <AdminCreateSheet
        open={open}
        onClose={() => {
          if (!deleting) {
            setConfirmOpen(false);
            setDeleteError(null);
            onClose();
          }
        }}
        title={title}
        description={
          company ? `${t(`statuses.${company.status}`)} · ${t(`types.${company.type}`)}` : undefined
        }
        headerActions={
          company ? (
            <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
              <ResendInviteButton companyId={company.id} />
              <IconButton
                label={t('detail.delete')}
                size="sm"
                className="text-danger hover:bg-danger-soft"
                disabled={deleting}
                onClick={() => {
                  setDeleteError(null);
                  setConfirmOpen(true);
                }}
              >
                <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
              </IconButton>
            </div>
          ) : undefined
        }
        size="wide"
      >
        {!companyId || query.isLoading ? (
          <p className="text-sm text-ink-secondary">{t('loading')}</p>
        ) : null}

        {companyId && (query.isError || (!query.isLoading && !company)) ? (
          <p role="alert" className="text-sm text-danger">
            {t('detail.notFound')}
          </p>
        ) : null}

        {deleteError ? (
          <p role="alert" className="text-sm text-danger">
            {deleteError === 'blocked' ? t('detail.deleteBlocked') : t('errors.generic')}
          </p>
        ) : null}

        {company ? (
          <div className="flex flex-col gap-8">
            <EditCompanyForm key={company.id} company={company} />
            {company.type === 'builder' ? <CompanyProjectsSection companyId={company.id} /> : null}
          </div>
        ) : null}
      </AdminCreateSheet>

      <ConfirmDeleteModal
        open={confirmOpen}
        title={t('detail.deleteConfirmTitle')}
        message={
          company
            ? tCommon('deleteConfirmNamedMessage', { name: company.name })
            : t('detail.deleteConfirmMessage')
        }
        confirming={deleting}
        onCancel={() => {
          if (!deleting) {
            setConfirmOpen(false);
          }
        }}
        onConfirm={onConfirmDelete}
      />
    </>
  );
};
