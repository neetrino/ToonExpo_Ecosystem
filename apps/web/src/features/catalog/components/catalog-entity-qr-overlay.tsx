'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

import { CatalogEntityQrBody } from '@/features/catalog/components/catalog-entity-qr-body';
import { useMinWidth } from '@/shared/hooks/use-min-width';
import { blurActiveElementAfterEscClose } from '@/shared/ui/blur-active-element';
import { lockBodyScroll, unlockBodyScroll } from '@/shared/ui/body-scroll-lock';
import { cn } from '@/shared/ui/cn';
import { IconButton } from '@/shared/ui/icon-button';
import { MOBILE_BOTTOM_NAV_SHEET_PB_CLASS } from '@/shared/ui/mobile-bottom-nav-clearance';
import { MODAL_BACKDROP_CLASS_NAME } from '@/shared/ui/modal-backdrop';
import { getOverlayPortalHost } from '@/shared/ui/overlay-portal-host';
import {
  SIDE_SHEET_BACKDROP_TRANSITION_MS,
  SIDE_SHEET_PANEL_TRANSITION_MS,
} from '@/shared/ui/side-sheet.constants';
import { useBottomSheetSwipeDismiss } from '@/shared/ui/use-bottom-sheet-swipe-dismiss';
import { useDrawerTransition } from '@/shared/ui/use-drawer-transition';
import { useModalEnterExit } from '@/shared/ui/use-modal-enter-exit';

export type CatalogEntityQrOverlayProps = {
  open: boolean;
  onClose: () => void;
  payloadUrl: string;
  codeLabel: string;
  entityName: string;
};

/** Drag distance used to fade backdrop while swiping down. */
const QR_SHEET_BACKDROP_DRAG_FADE_PX = 320;

const CatalogEntityQrDesktopModal = ({
  open,
  onClose,
  payloadUrl,
  codeLabel,
  entityName,
}: CatalogEntityQrOverlayProps) => {
  const t = useTranslations('Catalog.entityQr');
  const tCommon = useTranslations('Common');
  const titleId = useId();
  const { isVisible, isExiting, backdropMotionClass, panelMotionClass, handlePanelAnimationEnd } =
    useModalEnterExit({ isOpen: open });

  useEffect(() => {
    if (!isVisible || isExiting) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
        blurActiveElementAfterEscClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isVisible, isExiting, onClose]);

  if (!isVisible || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-x-0 top-0 z-[var(--z-modal)] flex h-fluid-screen items-center justify-center px-4"
      role="presentation"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={tCommon('close')}
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
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'relative flex w-full max-w-md flex-col',
          'rounded-2xl border border-border bg-surface-elevated shadow-xl',
          panelMotionClass,
        )}
        onClick={(event) => event.stopPropagation()}
        onAnimationEnd={handlePanelAnimationEnd}
      >
        <span id={titleId} className="sr-only">
          {t('title')}
        </span>
        <div className="absolute top-3 right-3 z-10">
          <IconButton label={tCommon('close')} onClick={onClose} size="sm" disabled={isExiting}>
            <X className="size-4" aria-hidden />
          </IconButton>
        </div>
        <div className="px-5 py-6">
          <CatalogEntityQrBody
            payloadUrl={payloadUrl}
            codeLabel={codeLabel}
            entityName={entityName}
            actionsDisabled={isExiting}
          />
        </div>
      </div>
    </div>,
    getOverlayPortalHost(),
  );
};

const CatalogEntityQrMobileSheet = ({
  open,
  onClose,
  payloadUrl,
  codeLabel,
  entityName,
}: CatalogEntityQrOverlayProps) => {
  const t = useTranslations('Catalog.entityQr');
  const tCommon = useTranslations('Common');
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const { rendered, visible } = useDrawerTransition(open, SIDE_SHEET_PANEL_TRANSITION_MS);
  const { isInteracting, dragY, sheetStyle } = useBottomSheetSwipeDismiss({
    enabled: rendered && visible,
    sheetRef: panelRef,
    onDismiss: onClose,
  });

  useEffect(() => {
    if (!rendered) {
      return;
    }
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [rendered]);

  useEffect(() => {
    if (!rendered) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
        blurActiveElementAfterEscClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [rendered, onClose]);

  if (!rendered || typeof document === 'undefined') {
    return null;
  }

  const backdropOpacity = visible ? Math.max(0, 1 - dragY / QR_SHEET_BACKDROP_DRAG_FADE_PX) : 0;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[var(--z-overlay)] touch-none overscroll-none lg:hidden',
        visible ? '' : 'pointer-events-none',
      )}
      aria-hidden={!visible}
      role="presentation"
    >
      <button
        type="button"
        tabIndex={visible ? 0 : -1}
        aria-hidden={!visible}
        aria-label={tCommon('close')}
        className={cn(
          'absolute inset-0',
          MODAL_BACKDROP_CLASS_NAME,
          'transition-opacity duration-[var(--qr-sheet-backdrop-ms)] ease-[var(--ease-out-premium)]',
          'motion-reduce:transition-none',
          isInteracting ? 'transition-none' : null,
        )}
        style={{
          ['--qr-sheet-backdrop-ms' as string]: `${SIDE_SHEET_BACKDROP_TRANSITION_MS}ms`,
          opacity: backdropOpacity,
        }}
        onClick={onClose}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={cn(
            'pointer-events-auto touch-auto flex w-full max-w-lg flex-col',
            'rounded-t-[15px] border border-border bg-surface-elevated shadow-lg',
            'will-change-transform',
            !isInteracting && [
              'transition-transform duration-[var(--qr-sheet-panel-ms)] ease-[var(--ease-out-premium)]',
              'motion-reduce:transition-none motion-reduce:duration-0',
              visible ? 'translate-y-0' : 'translate-y-full motion-reduce:translate-y-0',
            ],
          )}
          style={{
            ['--qr-sheet-panel-ms' as string]: `${SIDE_SHEET_PANEL_TRANSITION_MS}ms`,
            ...sheetStyle,
          }}
        >
          <span id={titleId} className="sr-only">
            {t('title')}
          </span>
          <div className="flex shrink-0 justify-center pt-2.5" aria-hidden>
            <span className="h-1 w-10 rounded-full bg-border-strong" />
          </div>
          <div className={cn('overflow-hidden px-5 pt-3', MOBILE_BOTTOM_NAV_SHEET_PB_CLASS)}>
            <CatalogEntityQrBody
              payloadUrl={payloadUrl}
              codeLabel={codeLabel}
              entityName={entityName}
              actionsDisabled={!visible}
            />
          </div>
        </div>
      </div>
    </div>,
    getOverlayPortalHost(),
  );
};

/**
 * Centered modal on desktop; bottom sheet popup on mobile (swipe-down to dismiss).
 */
export const CatalogEntityQrOverlay = (props: CatalogEntityQrOverlayProps) => {
  const isDesktop = useMinWidth();
  if (isDesktop) {
    return <CatalogEntityQrDesktopModal {...props} />;
  }
  return <CatalogEntityQrMobileSheet {...props} />;
};
