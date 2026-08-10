'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { cn } from '@/shared/ui/cn';

/** Mark the active nav row so the sliding pill can track it. */
export const PORTAL_NAV_ACTIVE_ATTR = 'data-portal-nav-active';

type PortalNavRailGroupProps = {
  children: ReactNode;
  /** Remeasure when route, collapse, or accordion state changes. */
  measureKey: string;
  className?: string | undefined;
  /** Flex gap between nav rows (must match children list). */
  gapClassName?: string | undefined;
};

type PillBox = {
  top: number;
  left: number;
  width: number;
  height: number;
};

/**
 * Portal sidebar list with a sliding active pill.
 * Pill is positioned with top/left/width/height (not transform) so it stays
 * locked to the active row — text stays optically centered.
 */
export const PortalNavRailGroup = ({
  children,
  measureKey,
  className,
  gapClassName = 'gap-0.5',
}: PortalNavRailGroupProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<PillBox | null>(null);
  const [enableTransition, setEnableTransition] = useState(false);

  const updatePill = useCallback((): void => {
    const root = contentRef.current;
    if (!root) {
      return;
    }

    const active = root.querySelector<HTMLElement>(`[${PORTAL_NAV_ACTIVE_ATTR}="true"]`);
    if (!active) {
      setPill(null);
      return;
    }

    const next: PillBox = {
      top: active.offsetTop,
      left: active.offsetLeft,
      width: active.offsetWidth,
      height: active.offsetHeight,
    };

    setPill((prev) =>
      prev &&
      prev.top === next.top &&
      prev.left === next.left &&
      prev.width === next.width &&
      prev.height === next.height
        ? prev
        : next,
    );
  }, []);

  useLayoutEffect(() => {
    updatePill();
  }, [measureKey, updatePill, children]);

  useEffect(() => {
    // Avoid animating from 0,0 on first paint.
    const frame = window.requestAnimationFrame(() => {
      setEnableTransition(true);
    });
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const root = contentRef.current;
    if (!root || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => {
      updatePill();
    });
    observer.observe(root);

    const scrollParent = root.parentElement;
    const onScroll = (): void => {
      updatePill();
    };
    scrollParent?.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      scrollParent?.removeEventListener('scroll', onScroll);
    };
  }, [updatePill, measureKey]);

  const pillStyle: CSSProperties | undefined = pill
    ? {
        top: pill.top,
        left: pill.left,
        width: pill.width,
        height: pill.height,
      }
    : undefined;

  return (
    <div className={cn(className)}>
      <div ref={contentRef} className={cn('relative flex flex-col', gapClassName)}>
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute z-0 rounded-pill bg-surface-elevated',
            enableTransition &&
              'transition-[top,left,width,height,opacity] duration-[var(--duration-slow)] ease-[var(--ease-out-premium)]',
            'motion-reduce:transition-none',
            pill ? 'opacity-100' : 'opacity-0',
          )}
          style={pillStyle}
        />
        {children}
      </div>
    </div>
  );
};
