'use client';

import { useEffect, useId, useState, type AnimationEvent } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

import { Button } from '@/shared/ui/button';
import { blurActiveElementAfterEscClose } from '@/shared/ui/blur-active-element';
import { cn } from '@/shared/ui/cn';
import { useModalEnterExit } from '@/shared/ui/use-modal-enter-exit';

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

type Snapshot = {
  title: string;
  message: string;
  confirmLabel: string | undefined;
  cancelLabel: string | undefined;
  showCancel: boolean;
};

/**
 * MaMarie-style centered delete confirmation with enter/exit motion.
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
  const { isVisible, isExiting, backdropMotionClass, panelMotionClass, handlePanelAnimationEnd } =
    useModalEnterExit({ isOpen: open });
  const [snapshot, setSnapshot] = useState<Snapshot>({
    title,
    message,
    confirmLabel,
    cancelLabel,
    showCancel,
  });

  useEffect(() => {
    if (open) {
      setSnapshot({ title, message, confirmLabel, cancelLabel, showCancel });
    }
  }, [open, title, message, confirmLabel, cancelLabel, showCancel]);

  const actionsDisabled = confirming || isExiting;
  const resolvedConfirm = snapshot.confirmLabel ?? t('delete');
  const resolvedCancel = snapshot.cancelLabel ?? t('cancel');

  useEffect(() => {
    if (!isVisible || actionsDisabled) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onCancel();
        blurActiveElementAfterEscClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isVisible, actionsDisabled, onCancel]);

  if (!isVisible || typeof document === 'undefined') {
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
        className={cn(
          'absolute inset-0 cursor-default rounded-none bg-ink/40',
          backdropMotionClass,
        )}
        disabled={actionsDisabled}
        onClick={() => {
          if (!actionsDisabled) {
            onCancel();
          }
        }}
      />
      <DeleteModalPanel
        titleId={titleId}
        messageId={messageId}
        title={snapshot.title}
        message={snapshot.message}
        confirmLabel={resolvedConfirm}
        cancelLabel={resolvedCancel}
        showCancel={snapshot.showCancel}
        confirming={confirming}
        actionsDisabled={actionsDisabled}
        panelMotionClass={panelMotionClass}
        onCancel={onCancel}
        onConfirm={onConfirm}
        onAnimationEnd={handlePanelAnimationEnd}
      />
    </div>,
    document.body,
  );
};

type DeleteModalPanelProps = {
  titleId: string;
  messageId: string;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  showCancel: boolean;
  confirming: boolean;
  actionsDisabled: boolean;
  panelMotionClass: string;
  onCancel: () => void;
  onConfirm: () => void;
  onAnimationEnd: (event: AnimationEvent<HTMLElement>) => void;
};

const DeleteModalPanel = ({
  titleId,
  messageId,
  title,
  message,
  confirmLabel,
  cancelLabel,
  showCancel,
  confirming,
  actionsDisabled,
  panelMotionClass,
  onCancel,
  onConfirm,
  onAnimationEnd,
}: DeleteModalPanelProps) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={messageId}
      className={cn(
        'relative w-full max-w-md rounded-2xl border border-border bg-surface-elevated p-5 shadow-xl',
        panelMotionClass,
      )}
      onClick={(event) => event.stopPropagation()}
      onAnimationEnd={onAnimationEnd}
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
            {cancelLabel}
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
          {confirming ? `${confirmLabel}…` : confirmLabel}
        </Button>
      </div>
    </div>
  );
};
