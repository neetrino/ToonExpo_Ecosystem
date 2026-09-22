'use client';

import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { AdminDeleteModal } from '@/shared/ui/admin-delete-modal';
import { Button } from '@/shared/ui/button';

type ListSelectionToolbarProps = {
  selectedCount: number;
  onClear: () => void;
  onConfirmDelete: () => Promise<void>;
  confirmTitle?: string | undefined;
  confirmMessage?: string | undefined;
};

/**
 * Bulk actions bar shown above a list table when rows are selected.
 */
export const ListSelectionToolbar = ({
  selectedCount,
  onClear,
  onConfirmDelete,
  confirmTitle,
  confirmMessage,
}: ListSelectionToolbarProps) => {
  const t = useTranslations('Common.listSelection');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (selectedCount === 0) {
    return null;
  }

  const runDelete = (): void => {
    setError(null);
    setDeleting(true);
    void onConfirmDelete()
      .then(() => {
        setConfirmOpen(false);
        onClear();
      })
      .catch(() => {
        setError(t('deleteError'));
      })
      .finally(() => {
        setDeleting(false);
      });
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border bg-surface px-3 py-2">
        <p className="text-sm font-medium text-ink">
          {t('selectedCount', { count: selectedCount })}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" variant="outline" disabled={deleting} onClick={onClear}>
            {t('clear')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="danger"
            disabled={deleting}
            onClick={() => {
              setError(null);
              setConfirmOpen(true);
            }}
          >
            <Trash2 className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
            {t('delete')}
          </Button>
        </div>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <AdminDeleteModal
        open={confirmOpen}
        title={confirmTitle ?? t('deleteConfirmTitle')}
        message={confirmMessage ?? t('deleteConfirm', { count: selectedCount })}
        confirmLabel={t('delete')}
        confirmVariant="danger"
        icon={<Trash2 className="size-5" strokeWidth={2} />}
        iconTone="danger"
        confirming={deleting}
        onCancel={() => {
          if (!deleting) {
            setConfirmOpen(false);
          }
        }}
        onConfirm={runDelete}
      />
    </>
  );
};
