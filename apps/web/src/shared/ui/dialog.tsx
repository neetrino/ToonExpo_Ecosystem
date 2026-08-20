'use client';

import {
  type AnimationEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { IconButton } from '@/shared/ui/icon-button';
import { blurActiveElementAfterEscClose } from '@/shared/ui/blur-active-element';
import { cn } from '@/shared/ui/cn';
import { MODAL_BACKDROP_CLASS_NAME } from '@/shared/ui/modal-backdrop';
import { getOverlayPortalHost } from '@/shared/ui/overlay-portal-host';
import { useModalEnterExit } from '@/shared/ui/use-modal-enter-exit';

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
 * Centered modal — same overlay host, dim, and enter/exit as AdminDeleteModal.
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
  const { isVisible, isExiting, backdropMotionClass, panelMotionClass, handlePanelAnimationEnd } =
    useModalEnterExit({ isOpen: open });

  useDialogEscape(isVisible, isExiting, onClose);
  useDialogFocus(panelRef, isVisible, isExiting);

  if (!isVisible || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <DialogOverlay
      closeLabel={resolvedCloseLabel}
      isExiting={isExiting}
      backdropMotionClass={backdropMotionClass}
      onClose={onClose}
    >
      <DialogPanel
        panelRef={panelRef}
        titleId={titleId}
        title={title}
        description={description}
        footer={footer}
        className={className}
        closeLabel={resolvedCloseLabel}
        isExiting={isExiting}
        panelMotionClass={panelMotionClass}
        onClose={onClose}
        onAnimationEnd={handlePanelAnimationEnd}
      >
        {children}
      </DialogPanel>
    </DialogOverlay>,
    getOverlayPortalHost(),
  );
};

const useDialogEscape = (isVisible: boolean, isExiting: boolean, onClose: () => void): void => {
  useEffect(() => {
    if (!isVisible || isExiting) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      onClose();
      blurActiveElementAfterEscClose();
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [isVisible, isExiting, onClose]);
};

const useDialogFocus = (
  panelRef: RefObject<HTMLDivElement | null>,
  isVisible: boolean,
  isExiting: boolean,
): void => {
  useEffect(() => {
    if (!isVisible || isExiting) {
      return;
    }
    panelRef.current
      ?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      ?.focus();
  }, [panelRef, isVisible, isExiting]);
};

type DialogOverlayProps = {
  closeLabel: string;
  isExiting: boolean;
  backdropMotionClass: string;
  onClose: () => void;
  children: ReactNode;
};

const DialogOverlay = ({
  closeLabel,
  isExiting,
  backdropMotionClass,
  onClose,
  children,
}: DialogOverlayProps) => (
  <div
    className="fixed inset-x-0 top-0 z-[var(--z-toast)] flex h-fluid-screen items-center justify-center px-4"
    data-overlay-modal=""
    role="presentation"
  >
    <button
      type="button"
      tabIndex={-1}
      aria-label={closeLabel}
      className={cn(
        'absolute inset-0 cursor-default rounded-none',
        MODAL_BACKDROP_CLASS_NAME,
        backdropMotionClass,
      )}
      disabled={isExiting}
      onClick={() => {
        if (!isExiting) {
          onClose();
        }
      }}
    />
    {children}
  </div>
);

type DialogPanelProps = {
  panelRef: RefObject<HTMLDivElement | null>;
  titleId: string;
  title: string;
  description: string | undefined;
  footer: ReactNode | undefined;
  className: string | undefined;
  closeLabel: string;
  isExiting: boolean;
  panelMotionClass: string;
  onClose: () => void;
  onAnimationEnd: (event: AnimationEvent<HTMLElement>) => void;
  children: ReactNode;
};

const DialogPanel = ({
  panelRef,
  titleId,
  title,
  description,
  footer,
  className,
  closeLabel,
  isExiting,
  panelMotionClass,
  onClose,
  onAnimationEnd,
  children,
}: DialogPanelProps) => (
  <div
    ref={panelRef}
    role="dialog"
    aria-modal="true"
    aria-labelledby={titleId}
    className={cn(
      'relative flex max-h-[min(90%,40rem)] w-full max-w-md flex-col',
      'rounded-2xl border border-border bg-surface-elevated shadow-xl',
      panelMotionClass,
      className,
    )}
    onClick={(event) => event.stopPropagation()}
    onAnimationEnd={onAnimationEnd}
  >
    <header className="flex shrink-0 items-start justify-between gap-3 px-5 pt-5 pb-3">
      <div className="min-w-0">
        <h2 id={titleId} className="text-lg font-semibold text-ink">
          {title}
        </h2>
        {description ? <p className="mt-1 text-sm text-ink-secondary">{description}</p> : null}
      </div>
      <IconButton label={closeLabel} onClick={onClose} size="sm" disabled={isExiting}>
        <X className="size-4" aria-hidden />
      </IconButton>
    </header>
    <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
    {footer ? <footer className="shrink-0 border-t border-border px-5 py-4">{footer}</footer> : null}
  </div>
);
