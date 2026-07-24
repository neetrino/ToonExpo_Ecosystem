'use client';

import { type ReactNode, useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { IconButton } from '@/shared/ui/icon-button';
import { blurActiveElementAfterEscClose } from '@/shared/ui/blur-active-element';
import { cn } from '@/shared/ui/cn';
import { MODAL_BACKDROP_CLASS_NAME } from '@/shared/ui/modal-backdrop';

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string | undefined;
  children: ReactNode;
  footer?: ReactNode | undefined;
  className?: string | undefined;
  closeLabel?: string | undefined;
};

/**
 * Centered modal for short focused actions (confirm, quick create).
 */
export const Dialog = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  closeLabel,
}: DialogProps) => {
  const t = useTranslations('Common');
  const resolvedCloseLabel = closeLabel ?? t('close');
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        blurActiveElementAfterEscClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    panelRef.current
      ?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      ?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label={resolvedCloseLabel}
        className={cn('absolute inset-0', MODAL_BACKDROP_CLASS_NAME)}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'relative z-10 flex max-h-[min(90dvh,640px)] w-full max-w-md flex-col',
          'rounded-lg border border-border bg-surface-elevated shadow-lg',
          className,
        )}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-ink">
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm text-ink-secondary">{description}</p> : null}
          </div>
          <IconButton label={resolvedCloseLabel} onClick={onClose} size="sm">
            <X className="size-4" aria-hidden />
          </IconButton>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <footer className="shrink-0 border-t border-border px-5 py-4">{footer}</footer>
        ) : null}
      </div>
    </div>
  );
};
