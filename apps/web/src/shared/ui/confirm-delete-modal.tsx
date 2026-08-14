'use client';

import { useTranslations } from 'next-intl';

import { AdminDeleteModal } from '@/shared/ui/admin-delete-modal';

type ConfirmDeleteModalProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirming?: boolean | undefined;
  title?: string | undefined;
  message?: string | undefined;
  confirmLabel?: string | undefined;
};

/**
 * Delete confirmation using Common copy unless a feature overrides title/message.
 */
export const ConfirmDeleteModal = ({
  open,
  onCancel,
  onConfirm,
  confirming,
  title,
  message,
  confirmLabel,
}: ConfirmDeleteModalProps) => {
  const t = useTranslations('Common');

  return (
    <AdminDeleteModal
      open={open}
      title={title ?? t('deleteConfirmTitle')}
      message={message ?? t('deleteConfirmMessage')}
      confirming={confirming}
      confirmLabel={confirmLabel}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
};
