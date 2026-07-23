'use client';

import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

import { lockBodyScroll, unlockBodyScroll } from '@/shared/ui/body-scroll-lock';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/cn';

type AdminDeleteModalProps = {
  open: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirming?: boolean | undefined;
  confirmLabel?: string | undefined;
  cancelLabel?: string | undefined;
  showCancel?: boolean | undefined;
};

/**
 * MaMarie-style centered delete confirmation modal.
 * @see https://ma-marie.vercel.app/supersudo/categories
 */
export const AdminDeleteModal = ({
  open,
  title,
  message,
  onCancel,
  onConfirm,
  confirming = false,
  confirmLabel,
  cancelLabel,
  showCancel = true,
}: AdminDeleteModalProps) => {
  const t = useTranslations('Common');
  const titleId = useId();
  const messageId = useId();
  const resolvedConfirm = confirmLabel ?? t('delete');
  const resolvedCancel = cancelLabel ?? t('cancel');
  const actionsDisabled = confirming;

  useEffect(() => {
    if (!open) {
      return;
    }
    lockBodyScroll();
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && !actionsDisabled) {
        onCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      unlockBodyScroll();
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, actionsDisabled, onCancel]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center px-4"
      role="presentation"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={resolvedCancel}
        className="absolute inset-0 cursor-default bg-ink/40"
        disabled={actionsDisabled}
        onClick={() => {
          if (!actionsDisabled) {
            onCancel();
          }
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        className={cn(
          'relative w-full max-w-md rounded-2xl border border-border bg-surface-elevated p-5 shadow-xl',
          'animate-[page-enter_var(--duration-base)_var(--ease-out-premium)_both]',
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id={titleId} className="mb-2 text-lg font-semibold text-ink">
          {title}
        </h3>
        <p id={messageId} className="text-sm leading-6 text-ink-secondary">
          {message}
        </p>
        <div className="mt-5 flex items-center justify-end gap-3">
          {showCancel ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-w-24"
              disabled={actionsDisabled}
              onClick={onCancel}
            >
              {resolvedCancel}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="danger"
            size="sm"
            className="min-w-24"
            disabled={actionsDisabled}
            onClick={onConfirm}
          >
            {confirming ? `${resolvedConfirm}…` : resolvedConfirm}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
