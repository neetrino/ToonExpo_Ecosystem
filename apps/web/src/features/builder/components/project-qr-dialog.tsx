'use client';

import { type ReactNode, useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { CatalogScope } from '@/features/builder/catalog-scope';
import { ProjectQrPanel } from '@/features/builder/components/project-qr-panel';
import { blurActiveElementAfterEscClose } from '@/shared/ui/blur-active-element';
import { lockBodyScroll, unlockBodyScroll } from '@/shared/ui/body-scroll-lock';
import { cn } from '@/shared/ui/cn';
import { IconButton } from '@/shared/ui/icon-button';
import { MODAL_BACKDROP_CLASS_NAME } from '@/shared/ui/modal-backdrop';
import { SideSheet } from '@/shared/ui/side-sheet';
import {
  SIDE_SHEET_BACKDROP_TRANSITION_MS,
  SIDE_SHEET_PANEL_TRANSITION_MS,
} from '@/shared/ui/side-sheet.constants';
import { useDrawerTransition } from '@/shared/ui/use-drawer-transition';

const DESKTOP_MIN_WIDTH_PX = 768;

type ProjectQrDialogProps = {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  /** Override catalog scope when the card is outside CatalogScopeProvider. */
  scope?: CatalogScope | undefined;
};

type ProjectQrMobileSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: ReactNode;
};

/**
 * Mobile bottom sheet with fade + slide-up enter/exit (same timing as SideSheet).
 */
const ProjectQrMobileSheet = ({
  open,
  onClose,
  title,
  description,
  children,
}: ProjectQrMobileSheetProps) => {
  const t = useTranslations('Common');
  const titleId = useId();
  const { rendered, visible } = useDrawerTransition(open, SIDE_SHEET_PANEL_TRANSITION_MS);

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

  return createPortal(
    <div
      className={cn('fixed inset-0 z-[var(--z-modal)]', visible ? '' : 'pointer-events-none')}
      aria-hidden={!visible}
      role="presentation"
    >
      <button
        type="button"
        tabIndex={visible ? 0 : -1}
        aria-hidden={!visible}
        aria-label={t('close')}
        className={cn(
          'absolute inset-0',
          MODAL_BACKDROP_CLASS_NAME,
          'transition-opacity duration-[var(--qr-sheet-backdrop-ms)] ease-[var(--ease-out-premium)]',
          'motion-reduce:transition-none',
          visible ? 'opacity-100' : 'opacity-0',
        )}
        style={{
          ['--qr-sheet-backdrop-ms' as string]: `${SIDE_SHEET_BACKDROP_TRANSITION_MS}ms`,
        }}
        onClick={onClose}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-0 sm:p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={cn(
            'pointer-events-auto flex max-h-[min(92dvh,640px)] w-full max-w-lg flex-col',
            'rounded-t-[15px] border border-border bg-surface-elevated shadow-lg sm:rounded-lg',
            'transition-transform duration-[var(--qr-sheet-panel-ms)] ease-[var(--ease-out-premium)]',
            'motion-reduce:transition-none motion-reduce:duration-0',
            'will-change-transform',
            visible ? 'translate-y-0' : 'translate-y-full motion-reduce:translate-y-0',
          )}
          style={{
            ['--qr-sheet-panel-ms' as string]: `${SIDE_SHEET_PANEL_TRANSITION_MS}ms`,
          }}
        >
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4">
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg font-semibold text-ink">
                {title}
              </h2>
              <p className="mt-1 text-sm text-ink-secondary">{description}</p>
            </div>
            <IconButton label={t('close')} onClick={onClose} size="sm">
              <X className="size-4" aria-hidden />
            </IconButton>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 safe-pb">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

/**
 * Project QR overlay — animated bottom sheet on mobile, SideSheet on desktop.
 */
export const ProjectQrDialog = ({
  open,
  onClose,
  projectId,
  projectName,
  scope,
}: ProjectQrDialogProps) => {
  const t = useTranslations('Builder.projects.qr');
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH_PX}px)`);
    const sync = (): void => {
      setIsDesktop(media.matches);
    };
    sync();
    media.addEventListener('change', sync);
    return () => {
      media.removeEventListener('change', sync);
    };
  }, []);

  const panel = (
    <ProjectQrPanel
      projectId={projectId}
      projectName={projectName}
      enabled={open}
      scope={scope}
      layout="modal"
    />
  );

  if (isDesktop) {
    return (
      <SideSheet
        open={open}
        onClose={onClose}
        title={t('title')}
        description={t('subtitle')}
        size="compact"
      >
        {panel}
      </SideSheet>
    );
  }

  return (
    <ProjectQrMobileSheet
      open={open}
      onClose={onClose}
      title={t('title')}
      description={t('subtitle')}
    >
      {panel}
    </ProjectQrMobileSheet>
  );
};
