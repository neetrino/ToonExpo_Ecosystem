'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';

import { ScannerWorkspace } from '@/features/builder/components/scanner-workspace';
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
import { useDrawerTransition } from '@/shared/ui/use-drawer-transition';

type BuilderScannerSheetProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Bottom sheet QR scanner — sits under the mobile bottom nav (`--z-bottom-nav`).
 */
export const BuilderScannerSheet = ({ open, onClose }: BuilderScannerSheetProps) => {
  const t = useTranslations('Builder.scanner');
  const tCommon = useTranslations('Common');
  const titleId = useId();
  const { rendered, visible } = useDrawerTransition(open, SIDE_SHEET_PANEL_TRANSITION_MS);
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setHost(getOverlayPortalHost());
  }, []);

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

  if (!rendered || !host) {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[var(--z-overlay)] lg:hidden',
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
          'transition-opacity duration-[var(--scanner-sheet-backdrop-ms)] ease-[var(--ease-out-premium)]',
          'motion-reduce:transition-none',
          visible ? 'opacity-100' : 'opacity-0',
        )}
        style={{
          ['--scanner-sheet-backdrop-ms' as string]: `${SIDE_SHEET_BACKDROP_TRANSITION_MS}ms`,
        }}
        onClick={onClose}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={cn(
            'pointer-events-auto flex w-full max-w-lg flex-col',
            'max-h-[min(88dvh,720px)]',
            'rounded-t-[15px] border border-border bg-surface-elevated shadow-lg',
            'transition-transform duration-[var(--scanner-sheet-panel-ms)] ease-[var(--ease-out-premium)]',
            'motion-reduce:transition-none motion-reduce:duration-0',
            'will-change-transform',
            visible ? 'translate-y-0' : 'translate-y-full motion-reduce:translate-y-0',
          )}
          style={{
            ['--scanner-sheet-panel-ms' as string]: `${SIDE_SHEET_PANEL_TRANSITION_MS}ms`,
          }}
        >
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4">
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg font-semibold text-ink">
                {t('title')}
              </h2>
              <p className="mt-1 text-sm text-ink-secondary">{t('subtitle')}</p>
            </div>
            <IconButton label={tCommon('close')} onClick={onClose} size="sm">
              <X className="size-4" aria-hidden />
            </IconButton>
          </header>
          <div
            className={cn(
              'min-h-0 flex-1 overflow-y-auto px-5 py-4',
              MOBILE_BOTTOM_NAV_SHEET_PB_CLASS,
            )}
          >
            {open ? <ScannerWorkspace /> : null}
          </div>
        </div>
      </div>
    </div>,
    host,
  );
};
