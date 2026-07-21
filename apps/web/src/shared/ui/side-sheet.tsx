'use client';

import { type ReactNode, useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

import { IconButton } from '@/shared/ui/icon-button';
import { cn } from '@/shared/ui/cn';

type SideSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string | undefined;
  children: ReactNode;
  footer?: ReactNode | undefined;
  /** Stacking level for nested sheets (0 = base). */
  stackLevel?: number | undefined;
  className?: string | undefined;
  closeLabel?: string | undefined;
};

const BASE_Z = 70;
const STACK_Z_STEP = 5;

/**
 * Right-side inspection/edit sheet. Near full-screen on mobile.
 * Preserves Page → Card → Side Sheet workspace pattern.
 */
export const SideSheet = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  stackLevel = 0,
  className,
  closeLabel = 'Close',
}: SideSheetProps) => {
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
      }
    };
    window.addEventListener('keydown', onKeyDown);

    const focusable = panelRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const zIndex = BASE_Z + stackLevel * STACK_Z_STEP;

  return (
    <div className="fixed inset-0" style={{ zIndex }} role="presentation">
      <button
        type="button"
        aria-label={closeLabel}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'absolute inset-y-0 right-0 flex w-full max-w-lg flex-col',
          'bg-surface-elevated shadow-sheet',
          'max-md:max-w-none',
          className,
        )}
        style={{
          transform: `translateX(-${stackLevel * 12}px)`,
        }}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold tracking-tight text-ink">
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm text-ink-secondary">{description}</p> : null}
          </div>
          <IconButton label={closeLabel} onClick={onClose} size="sm">
            <X className="size-4" aria-hidden />
          </IconButton>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer ? (
          <footer className="safe-pb shrink-0 border-t border-border px-5 py-4 sm:px-6">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
};
