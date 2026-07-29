'use client';

import { ScanLine } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useMeQuery } from '@/features/auth/hooks/use-auth';
import { BuyerQrCode } from '@/features/buyer/components/buyer-qr-code';
import { BuyerScannerWorkspace } from '@/features/buyer/components/buyer-scanner-workspace';
import { useBuyerQrQuery } from '@/features/buyer/hooks/use-buyer';
import { isBuyerAccount } from '@/features/buyer/utils/is-buyer-account';
import { Link } from '@/i18n/navigation';
import { blurActiveElementAfterEscClose } from '@/shared/ui/blur-active-element';
import { lockBodyScroll, unlockBodyScroll } from '@/shared/ui/body-scroll-lock';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/cn';
import { MOBILE_BOTTOM_NAV_SHEET_PB_CLASS } from '@/shared/ui/mobile-bottom-nav-clearance';
import { MODAL_BACKDROP_CLASS_NAME } from '@/shared/ui/modal-backdrop';
import { getOverlayPortalHost } from '@/shared/ui/overlay-portal-host';
import {
  SIDE_SHEET_BACKDROP_TRANSITION_MS,
  SIDE_SHEET_PANEL_TRANSITION_MS,
} from '@/shared/ui/side-sheet.constants';
import { Skeleton } from '@/shared/ui/skeleton';
import { useBottomSheetSwipeDismiss } from '@/shared/ui/use-bottom-sheet-swipe-dismiss';
import { useDrawerTransition } from '@/shared/ui/use-drawer-transition';

type BuyerQrSheetProps = {
  open: boolean;
  onClose: () => void;
};

type SheetMode = 'qr' | 'scanner';

type BuyerQrSheetBodyProps = {
  onOpenScanner: () => void;
};

const BuyerQrSheetBody = ({ onOpenScanner }: BuyerQrSheetBodyProps) => {
  const t = useTranslations('Profile.qr');
  const { data: me, isLoading: meLoading } = useMeQuery();
  const isBuyer = isBuyerAccount(me);
  const qrQuery = useBuyerQrQuery(Boolean(me) && isBuyer);

  const scannerButton = (
    <Button
      type="button"
      variant="secondary"
      className="mx-auto w-full max-w-md"
      onClick={onOpenScanner}
    >
      <ScanLine className="size-4" aria-hidden />
      {t('scanner.open')}
    </Button>
  );

  if (meLoading || (isBuyer && qrQuery.isLoading)) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="mx-auto h-80 w-full max-w-sm" />
        {scannerButton}
      </div>
    );
  }

  if (!me) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col items-center gap-3 px-2 py-4 text-center">
          <p className="text-sm text-ink-secondary">{t('sheet.loginHint')}</p>
          <Link
            href="/auth/login?returnUrl=%2Fqr"
            className="text-sm font-semibold text-brand hover:underline"
          >
            {t('sheet.login')}
          </Link>
        </div>
        {scannerButton}
      </div>
    );
  }

  if (!isBuyer) {
    return (
      <div className="flex flex-col gap-3">
        <p className="py-4 text-center text-sm text-ink-secondary">{t('sheet.buyerOnly')}</p>
        {scannerButton}
      </div>
    );
  }

  if (qrQuery.isError || !qrQuery.data) {
    return (
      <div className="flex flex-col gap-3">
        <p role="alert" className="py-4 text-center text-sm text-danger">
          {t('error')}
        </p>
        {scannerButton}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <BuyerQrCode payloadUrl={qrQuery.data.payloadUrl} buyerName={me.name} />
      {scannerButton}
    </div>
  );
};

/**
 * Bottom sheet My QR — content-sized, swipe-down to close (under bottom nav).
 */
export const BuyerQrSheet = ({ open, onClose }: BuyerQrSheetProps) => {
  const t = useTranslations('Profile.qr');
  const tScanner = useTranslations('Profile.qr.scanner');
  const tCommon = useTranslations('Common');
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const { rendered, visible } = useDrawerTransition(open, SIDE_SHEET_PANEL_TRANSITION_MS);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [mode, setMode] = useState<SheetMode>('qr');
  const { isInteracting, dragY, sheetStyle } = useBottomSheetSwipeDismiss({
    enabled: rendered && visible,
    sheetRef: panelRef,
    onDismiss: onClose,
  });

  useEffect(() => {
    setHost(getOverlayPortalHost());
  }, []);

  useEffect(() => {
    if (!open) {
      setMode('qr');
    }
  }, [open]);

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
        if (mode === 'scanner') {
          setMode('qr');
          return;
        }
        onClose();
        blurActiveElementAfterEscClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [rendered, onClose, mode]);

  if (!rendered || !host) {
    return null;
  }

  const isScanner = mode === 'scanner';
  const title = isScanner ? tScanner('title') : t('title');
  const subtitle = isScanner ? tScanner('subtitle') : null;
  const backdropOpacity = visible ? Math.max(0, 1 - dragY / 320) : 0;

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
          {...(isScanner ? { 'aria-labelledby': titleId } : { 'aria-label': title })}
          className={cn(
            'pointer-events-auto flex w-full max-w-lg flex-col',
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
          {isScanner ? (
            <header className="shrink-0 px-5 pb-3 pt-2">
              <h2 id={titleId} className="text-lg font-semibold text-ink">
                {title}
              </h2>
              {subtitle ? <p className="mt-1 text-sm text-ink-secondary">{subtitle}</p> : null}
            </header>
          ) : null}
          <div
            className={cn(
              'px-5',
              isScanner ? 'pt-1' : 'pt-3',
              MOBILE_BOTTOM_NAV_SHEET_PB_CLASS,
              isScanner ? 'min-h-0 overflow-y-auto' : 'overflow-hidden',
            )}
          >
            {open ? (
              isScanner ? (
                <BuyerScannerWorkspace onNavigated={onClose} />
              ) : (
                <BuyerQrSheetBody
                  onOpenScanner={() => {
                    setMode('scanner');
                  }}
                />
              )
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    host,
  );
};
