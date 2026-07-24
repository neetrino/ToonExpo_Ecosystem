'use client';

import { type ReactNode, type RefObject, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

import { lockBodyScroll, unlockBodyScroll } from '@/shared/ui/body-scroll-lock';
import { blurActiveElementAfterEscClose } from '@/shared/ui/blur-active-element';
import { isFloorPlanLightboxOpen } from '@/shared/ui/floor-plan-lightbox-stack';
import { DrawerCloseTab } from '@/shared/ui/drawer-close-tab';
import { cn } from '@/shared/ui/cn';
import { isTopSideSheetLevel, registerSideSheetLevel } from '@/shared/ui/side-sheet-escape-stack';
import {
  SIDE_SHEET_BACKDROP_TRANSITION_MS,
  SIDE_SHEET_COMFORTABLE_MAX_WIDTH_PX,
  SIDE_SHEET_COMPACT_MAX_WIDTH_PX,
  SIDE_SHEET_PANEL_TRANSITION_MS,
  SIDE_SHEET_PANEL_Z_INDEX,
  SIDE_SHEET_STACK_Z_STEP,
  SIDE_SHEET_WIDTH_PERCENT,
  SIDE_SHEET_Z_INDEX,
} from '@/shared/ui/side-sheet.constants';
import { useDrawerTransition } from '@/shared/ui/use-drawer-transition';

type SideSheetSize = 'default' | 'compact' | 'comfortable';

type SideSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string | undefined;
  children: ReactNode;
  footer?: ReactNode | undefined;
  headerActions?: ReactNode | undefined;
  /** Stacking level for nested sheets (0 = base). */
  stackLevel?: number | undefined;
  /** `compact` ≈ 420px; `comfortable` ≈ 500px; `default` ≈ 50vw. */
  size?: SideSheetSize | undefined;
  className?: string | undefined;
  closeLabel?: string | undefined;
};

type SideSheetPanelProps = {
  visible: boolean;
  title: string;
  description?: string | undefined;
  headerActions?: ReactNode | undefined;
  footer?: ReactNode | undefined;
  closeLabel: string;
  onClose: () => void;
  panelRef: RefObject<HTMLDivElement | null>;
  scrollRef: RefObject<HTMLDivElement | null>;
  titleId: string;
  stackLevel: number;
  size: SideSheetSize;
  className?: string | undefined;
  children: ReactNode;
};

const SideSheetPanel = ({
  visible,
  title,
  description,
  headerActions,
  footer,
  closeLabel,
  onClose,
  panelRef,
  scrollRef,
  titleId,
  stackLevel,
  size,
  className,
  children,
}: SideSheetPanelProps) => {
  const zIndex = SIDE_SHEET_Z_INDEX + stackLevel * SIDE_SHEET_STACK_Z_STEP;
  const isFixedMax = size === 'compact' || size === 'comfortable';
  const compactMaxPx =
    size === 'comfortable' ? SIDE_SHEET_COMFORTABLE_MAX_WIDTH_PX : SIDE_SHEET_COMPACT_MAX_WIDTH_PX;

  return (
    <div
      className={cn('fixed inset-0', visible ? '' : 'pointer-events-none')}
      style={{ zIndex }}
      aria-hidden={!visible}
      role="presentation"
    >
      <button
        type="button"
        tabIndex={visible ? 0 : -1}
        aria-hidden={!visible}
        aria-label={closeLabel}
        className={cn(
          'absolute inset-0 bg-ink/45 backdrop-blur-[2px]',
          'transition-opacity duration-[var(--side-sheet-backdrop-ms)] ease-[var(--ease-out-premium)]',
          'motion-reduce:transition-none',
          visible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        style={{
          ['--side-sheet-backdrop-ms' as string]: `${SIDE_SHEET_BACKDROP_TRANSITION_MS}ms`,
        }}
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className={cn(
          'fixed top-0 right-0 h-dvh max-h-dvh',
          isFixedMax
            ? 'w-full max-w-[var(--side-sheet-compact-max)]'
            : 'w-full max-md:max-w-none md:w-[var(--side-sheet-width)]',
          'transition-transform duration-[var(--side-sheet-panel-ms)] ease-[var(--ease-out-premium)]',
          'motion-reduce:transition-none motion-reduce:duration-0',
          'will-change-transform',
          visible
            ? 'pointer-events-auto translate-x-0'
            : 'pointer-events-none translate-x-full motion-reduce:translate-x-0',
        )}
        style={{
          ['--side-sheet-width' as string]: `${SIDE_SHEET_WIDTH_PERCENT}%`,
          ['--side-sheet-compact-max' as string]: `${compactMaxPx}px`,
          ['--side-sheet-panel-ms' as string]: `${SIDE_SHEET_PANEL_TRANSITION_MS}ms`,
        }}
      >
        <DrawerCloseTab edge="start" onClose={onClose} closeLabel={closeLabel} />
        <aside
          className={cn(
            'relative flex h-full w-full flex-col overflow-hidden',
            'rounded-l-[15px] border border-border bg-surface-elevated',
            'shadow-[var(--shadow-sheet)]',
            className,
          )}
          style={{ zIndex: SIDE_SHEET_PANEL_Z_INDEX }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={(event) => event.stopPropagation()}
        >
          <header className="shrink-0 border-b border-border px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="text-lg font-semibold leading-tight text-ink">
                  {title}
                </h2>
                {description ? (
                  <p className="mt-1 text-sm text-ink-secondary">{description}</p>
                ) : null}
              </div>
              {headerActions ? (
                <div className="shrink-0 sm:self-center">{headerActions}</div>
              ) : null}
            </div>
          </header>

          <div
            ref={scrollRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4"
          >
            {children}
          </div>

          {footer ? (
            <footer className="safe-pb shrink-0 border-t border-border px-5 py-4">{footer}</footer>
          ) : null}
        </aside>
      </div>
    </div>
  );
};

/**
 * Full-viewport overlay sheet — does not resize page content; slides over everything.
 */
export const SideSheet = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  headerActions,
  stackLevel = 0,
  size = 'default',
  className,
  closeLabel,
}: SideSheetProps) => {
  const t = useTranslations('Common');
  const resolvedCloseLabel = closeLabel ?? t('close');
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
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

    const unregister = registerSideSheetLevel(stackLevel);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) {
        return;
      }
      if (isFloorPlanLightboxOpen()) {
        return;
      }
      if (!isTopSideSheetLevel(stackLevel)) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      onCloseRef.current();
      blurActiveElementAfterEscClose();
    };
    window.addEventListener('keydown', onKeyDown, true);

    return () => {
      unregister();
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [rendered, stackLevel]);

  if (!rendered || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <SideSheetPanel
      visible={visible}
      title={title}
      description={description}
      headerActions={headerActions}
      footer={footer}
      closeLabel={resolvedCloseLabel}
      onClose={onClose}
      panelRef={panelRef}
      scrollRef={scrollRef}
      titleId={titleId}
      stackLevel={stackLevel}
      size={size}
      className={className}
    >
      {children}
    </SideSheetPanel>,
    document.body,
  );
};
