'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { ScannerWorkspace } from '@/features/builder/components/scanner-workspace';
import { blurActiveElementAfterEscClose } from '@/shared/ui/blur-active-element';
import { cn } from '@/shared/ui/cn';
import { MOBILE_BOTTOM_NAV_SHEET_PB_CLASS } from '@/shared/ui/mobile-bottom-nav-clearance';
import { SHEET_BACKDROP_CLASS_NAME } from '@/shared/ui/modal-backdrop';
import { getOverlayPortalHost } from '@/shared/ui/overlay-portal-host';
import {
  SIDE_SHEET_BACKDROP_TRANSITION_MS,
  SIDE_SHEET_PANEL_TRANSITION_MS,
} from '@/shared/ui/side-sheet.constants';
import { useBottomSheetSwipeDismiss } from '@/shared/ui/use-bottom-sheet-swipe-dismiss';
import { useDrawerTransition } from '@/shared/ui/use-drawer-transition';

type BuilderScannerSheetProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Bottom sheet QR scanner — swipe-down dismiss like navbar My QR (`BuyerQrSheet`).
 */
export const BuilderScannerSheet = ({ open, onClose }: BuilderScannerSheetProps) => {
  const t = useTranslations('Builder.scanner');
  const tCommon = useTranslations('Common');
  const panelRef = useRef<HTMLDivElement>(null);
  const { rendered, visible } = useDrawerTransition(open, SIDE_SHEET_PANEL_TRANSITION_MS);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const { isInteracting, dragY, sheetStyle } = useBottomSheetSwipeDismiss({
    enabled: rendered && visible,
    sheetRef: panelRef,
    onDismiss: onClose,
  });

  useEffect(() => {
    setHost(getOverlayPortalHost());
  }, []);

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

  if (!rendered || !host) {
    return null;
  }

  const backdropOpacity = visible ? Math.max(0, 1 - dragY / 320) : 0;

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
          SHEET_BACKDROP_CLASS_NAME,
          'transition-opacity duration-[var(--scanner-sheet-backdrop-ms)] ease-[var(--ease-out-premium)]',
          'motion-reduce:transition-none',
          isInteracting ? 'transition-none' : null,
        )}
        style={{
          ['--scanner-sheet-backdrop-ms' as string]: `${SIDE_SHEET_BACKDROP_TRANSITION_MS}ms`,
          opacity: backdropOpacity,
        }}
        onClick={onClose}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t('title')}
          className={cn(
            'pointer-events-auto touch-auto flex w-full max-w-lg flex-col',
            'rounded-t-[15px] border border-border bg-surface-elevated shadow-lg',
            'will-change-transform',
            !isInteracting && [
              'transition-transform duration-[var(--scanner-sheet-panel-ms)] ease-[var(--ease-out-premium)]',
              'motion-reduce:transition-none motion-reduce:duration-0',
              visible ? 'translate-y-0' : 'translate-y-full motion-reduce:translate-y-0',
            ],
          )}
          style={{
            ['--scanner-sheet-panel-ms' as string]: `${SIDE_SHEET_PANEL_TRANSITION_MS}ms`,
            ...sheetStyle,
          }}
        >
          <div className="flex shrink-0 justify-center pt-2.5" aria-hidden>
            <span className="h-1 w-10 rounded-full bg-border-strong" />
          </div>
          <div className={cn('overflow-hidden px-5 pt-3', MOBILE_BOTTOM_NAV_SHEET_PB_CLASS)}>
            <ScannerWorkspace />
          </div>
        </div>
      </div>
    </div>,
    host,
  );
};
