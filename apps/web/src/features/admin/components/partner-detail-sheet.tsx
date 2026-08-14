'use client';

import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { AdminPartnerDetailForm } from '@/features/admin/components/admin-partner-detail-form';
import {
  useAdminPartnerQuery,
  useDeletePartnerMutation,
} from '@/features/admin/hooks/use-admin-partners';
import {
  FeaturedBadge,
  PartnerStatusBadge,
  PublicationStatusBadge,
} from '@/features/partners/components/partner-badges';
import { PartnerTypeLabel } from '@/features/partners/components/partner-type-label';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { ConfirmDeleteModal } from '@/shared/ui/confirm-delete-modal';
import { IconButton } from '@/shared/ui/icon-button';

type PartnerDetailSheetProps = {
  partnerId: string | null;
  open: boolean;
  onClose: () => void;
};

/**
 * Right-side sheet with partner edit form and offers management.
 */
export const PartnerDetailSheet = ({ partnerId, open, onClose }: PartnerDetailSheetProps) => {
  const t = useTranslations('Admin.partners.detail');
  const tCommon = useTranslations('Common');
  const query = useAdminPartnerQuery(partnerId ?? '');
  const deleteMutation = useDeletePartnerMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const partner = query.data;
  const title = partner?.name ?? t('sheetTitle');
  const deleting = deleteMutation.isPending;

  const onConfirmDelete = (): void => {
    if (!partnerId || deleting) {
      return;
    }
    void deleteMutation.mutateAsync(partnerId).then(() => {
      setConfirmOpen(false);
      onClose();
    });
  };

  return (
    <>
      <AdminCreateSheet
        open={open}
        onClose={() => {
          if (!deleting) {
            setConfirmOpen(false);
            onClose();
          }
        }}
        title={title}
        headerActions={
          partner ? (
            <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
              <PartnerTypeLabel type={partner.type} className="text-sm text-ink-secondary" />
              <PartnerStatusBadge status={partner.status} />
              <PublicationStatusBadge status={partner.publicationStatus} />
              <FeaturedBadge featured={partner.featured} />
              <IconButton
                label={t('delete')}
                size="sm"
                className="text-danger hover:bg-danger-soft"
                disabled={deleting}
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
              </IconButton>
            </div>
          ) : undefined
        }
        size="default"
      >
        {!partnerId || query.isLoading ? (
          <p className="text-sm text-ink-secondary">{t('loading')}</p>
        ) : null}

        {partnerId && (query.isError || (!query.isLoading && !partner)) ? (
          <p role="alert" className="text-sm text-danger">
            {t('notFound')}
          </p>
        ) : null}

        {partner && partnerId ? (
          <AdminPartnerDetailForm
            key={partner.id}
            partnerId={partnerId}
            partner={partner}
            onSaved={onClose}
          />
        ) : null}
      </AdminCreateSheet>

      <ConfirmDeleteModal
        open={confirmOpen}
        title={t('deleteConfirmTitle')}
        message={
          partner
            ? tCommon('deleteConfirmNamedMessage', { name: partner.name })
            : t('deleteConfirmMessage')
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
