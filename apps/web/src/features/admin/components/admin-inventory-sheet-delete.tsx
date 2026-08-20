'use client';

import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { AdminDeleteModal } from '@/shared/ui/admin-delete-modal';
import { IconButton } from '@/shared/ui/icon-button';

type AdminInventorySheetDeleteProps = {
  confirmTitle: string;
  confirmMessage: string;
  open: boolean;
  busy: boolean;
  onOpen: () => void;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * Danger delete control + confirm modal for catalog inventory sheets.
 */
export const AdminInventorySheetDelete = ({
  confirmTitle,
  confirmMessage,
  open,
  busy,
  onOpen,
  onCancel,
  onConfirm,
}: AdminInventorySheetDeleteProps) => {
  const t = useTranslations('Common');

  return (
    <>
      <IconButton
        label={t('delete')}
        size="sm"
        className="text-danger hover:bg-danger-soft"
        disabled={busy}
        onClick={onOpen}
      >
        <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
      </IconButton>
      <AdminDeleteModal
        open={open}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel={t('delete')}
        confirmVariant="danger"
        icon={<Trash2 className="size-5" strokeWidth={2} />}
        iconTone="danger"
        confirming={busy}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    </>
  );
};
