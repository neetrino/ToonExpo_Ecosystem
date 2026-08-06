'use client';

import { QrCode, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useRef, useState, type AnimationEvent } from 'react';
import { createPortal } from 'react-dom';

import { CATALOG_ENTITY_QR_SIZE_PX } from '@/features/catalog/constants';
import { blurActiveElementAfterEscClose } from '@/shared/ui/blur-active-element';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/cn';
import { IconButton } from '@/shared/ui/icon-button';
import { MODAL_BACKDROP_CLASS_NAME } from '@/shared/ui/modal-backdrop';
import { getOverlayPortalHost } from '@/shared/ui/overlay-portal-host';
import { useModalEnterExit } from '@/shared/ui/use-modal-enter-exit';

/** How long the “copied” affordance stays visible after a successful clipboard write. */
const QR_COPIED_FEEDBACK_MS = 2000;

type CatalogEntityQrProps = {
  payloadUrl: string;
  /** Accessible title for the QR SVG inside the modal. */
  codeLabel: string;
  entityName: string;
  className?: string | undefined;
};

type CatalogEntityQrModalProps = {
  open: boolean;
  onClose: () => void;
  payloadUrl: string;
  codeLabel: string;
  entityName: string;
};

type CatalogEntityQrModalPanelProps = {
  titleId: string;
  title: string;
  subtitle: string;
  closeLabel: string;
  payloadUrl: string;
  codeLabel: string;
  entityName: string;
  isExiting: boolean;
  backdropMotionClass: string;
  panelMotionClass: string;
  onClose: () => void;
  onAnimationEnd: (event: AnimationEvent<HTMLElement>) => void;
};

type CatalogEntityQrModalBodyProps = {
  payloadUrl: string;
  codeLabel: string;
  entityName: string;
  actionsDisabled: boolean;
};

const CatalogEntityQrModalBody = ({
  payloadUrl,
  codeLabel,
  entityName,
  actionsDisabled,
}: CatalogEntityQrModalBodyProps) => {
  const t = useTranslations('Catalog.entityQr');
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current !== null) {
        window.clearTimeout(copiedTimerRef.current);
      }
    };
  }, []);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(payloadUrl);
      setCopied(true);
      if (copiedTimerRef.current !== null) {
        window.clearTimeout(copiedTimerRef.current);
      }
      copiedTimerRef.current = window.setTimeout(() => {
        copiedTimerRef.current = null;
        setCopied(false);
      }, QR_COPIED_FEEDBACK_MS);
    } catch {
      setCopied(false);
    }
  }, [payloadUrl]);

  return (
    <div className="flex flex-col items-center gap-4 px-5 py-4">
      <div className="w-full max-w-[min(100%,17.5rem)] rounded-md border border-border bg-white p-4 shadow-xs sm:p-5">
        <div className="aspect-square w-full [&_svg]:h-auto [&_svg]:w-full">
          <QRCodeSVG
            value={payloadUrl}
            size={CATALOG_ENTITY_QR_SIZE_PX}
            level="M"
            marginSize={2}
            title={codeLabel}
          />
        </div>
      </div>
      <p className="font-brand text-lg font-bold tracking-tight text-ink">{entityName}</p>
      <p className="max-w-sm break-all px-1 text-center text-xs text-ink-secondary">{payloadUrl}</p>
      <Button
        type="button"
        size="md"
        variant="primary"
        className="w-full max-w-xs"
        disabled={actionsDisabled}
        onClick={() => {
          void onCopy();
        }}
      >
        {copied ? t('copied') : t('copyLink')}
      </Button>
    </div>
  );
};

const CatalogEntityQrModalPanel = ({
  titleId,
  title,
  subtitle,
  closeLabel,
  payloadUrl,
  codeLabel,
  entityName,
  isExiting,
  backdropMotionClass,
  panelMotionClass,
  onClose,
  onAnimationEnd,
}: CatalogEntityQrModalPanelProps) => (
  <div
    className="fixed inset-x-0 top-0 z-[var(--z-modal)] flex h-fluid-screen items-center justify-center px-4"
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={cn(
        'relative flex max-h-[min(90dvh,640px)] w-full max-w-md flex-col',
        'rounded-2xl border border-border bg-surface-elevated shadow-xl',
        panelMotionClass,
      )}
      onClick={(event) => event.stopPropagation()}
      onAnimationEnd={onAnimationEnd}
    >
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <h2 id={titleId} className="text-lg font-semibold text-ink">
            {title}
          </h2>
          <p className="mt-1 text-sm text-ink-secondary">{subtitle}</p>
        </div>
        <IconButton label={closeLabel} onClick={onClose} size="sm" disabled={isExiting}>
          <X className="size-4" aria-hidden />
        </IconButton>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <CatalogEntityQrModalBody
          payloadUrl={payloadUrl}
          codeLabel={codeLabel}
          entityName={entityName}
          actionsDisabled={isExiting}
        />
      </div>
    </div>
  </div>
);

/**
 * Centered QR modal with the same enter/exit motion as delete confirmation.
 */
const CatalogEntityQrModal = ({
  open,
  onClose,
  payloadUrl,
  codeLabel,
  entityName,
}: CatalogEntityQrModalProps) => {
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
    <CatalogEntityQrModalPanel
      titleId={titleId}
      title={t('title')}
      subtitle={t('subtitle')}
      closeLabel={tCommon('close')}
      payloadUrl={payloadUrl}
      codeLabel={codeLabel}
      entityName={entityName}
      isExiting={isExiting}
      backdropMotionClass={backdropMotionClass}
      panelMotionClass={panelMotionClass}
      onClose={onClose}
      onAnimationEnd={handlePanelAnimationEnd}
    />,
    getOverlayPortalHost(),
  );
};

/**
 * Icon opposite the title — opens a centered modal with the entity QR (project / apartment).
 */
export const CatalogEntityQr = ({
  payloadUrl,
  codeLabel,
  entityName,
  className,
}: CatalogEntityQrProps) => {
  const t = useTranslations('Catalog.entityQr');
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        label={t('open')}
        variant="soft"
        size="lg"
        className={cn('shrink-0', className)}
        onClick={() => {
          setOpen(true);
        }}
      >
        <QrCode className="size-5" aria-hidden />
      </IconButton>

      <CatalogEntityQrModal
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        payloadUrl={payloadUrl}
        codeLabel={codeLabel}
        entityName={entityName}
      />
    </>
  );
};
