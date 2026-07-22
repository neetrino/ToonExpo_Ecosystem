'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/shared/ui/cn';

const MENU_GAP_PX = 8;
const VIEWPORT_EDGE_PAD_PX = 8;
/** Used before the menu has been measured. */
const MENU_HEIGHT_ESTIMATE_PX = 240;

type DropdownPortalProps = {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  className?: string | undefined;
  /** `start` aligns to the left edge; `end` to the right edge of the anchor. */
  align?: 'start' | 'end' | undefined;
  /** Match trigger width at minimum (field selects). */
  matchWidth?: boolean | undefined;
};

type MenuCoords = {
  left: number;
  right: number;
  width: number;
  align: 'start' | 'end';
  placement: 'bottom' | 'top';
  /** Distance from viewport top (bottom placement) or unused. */
  top: number;
  /** Distance from viewport bottom (top placement). */
  bottom: number;
  maxHeight: number;
};

const shouldOpenUpward = (spaceBelow: number, spaceAbove: number, menuHeight: number): boolean => {
  const needed = menuHeight > 0 ? menuHeight : MENU_HEIGHT_ESTIMATE_PX;
  if (spaceBelow >= needed) {
    return false;
  }
  return spaceAbove > spaceBelow;
};

/**
 * Renders a menu in `document.body` with fixed coords so it stacks above
 * overflow-clipped parents, cards, and the header.
 *
 * Opens upward when there is not enough room below the trigger.
 * Applies the same desktop fluid scale as `.desktop-fluid-stage`.
 */
export const DropdownPortal = ({
  open,
  anchorRef,
  children,
  className,
  align = 'start',
  matchWidth = false,
}: DropdownPortalProps) => {
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<MenuCoords | null>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }

    const update = (): void => {
      const anchor = anchorRef.current;
      if (!anchor) {
        return;
      }

      const rect = anchor.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP_PX - VIEWPORT_EDGE_PAD_PX;
      const spaceAbove = rect.top - MENU_GAP_PX - VIEWPORT_EDGE_PAD_PX;
      const measuredHeight = portalRef.current?.offsetHeight ?? 0;
      const openUp = shouldOpenUpward(spaceBelow, spaceAbove, measuredHeight);
      const maxHeight = Math.max(120, openUp ? spaceAbove : spaceBelow);

      setCoords({
        placement: openUp ? 'top' : 'bottom',
        top: rect.bottom + MENU_GAP_PX,
        bottom: window.innerHeight - rect.top + MENU_GAP_PX,
        left: Math.max(VIEWPORT_EDGE_PAD_PX, rect.left),
        right: Math.max(VIEWPORT_EDGE_PAD_PX, window.innerWidth - rect.right),
        width: anchor.offsetWidth,
        align,
        maxHeight,
      });
    };

    update();
    const frameId = window.requestAnimationFrame(update);
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, anchorRef, align]);

  if (!mounted || !open || coords == null) {
    return null;
  }

  const originX = coords.align === 'end' ? 'right' : 'left';
  const originY = coords.placement === 'top' ? 'bottom' : 'top';

  const style: CSSProperties = {
    ...(coords.placement === 'bottom' ? { top: coords.top } : { bottom: coords.bottom }),
    ...(coords.align === 'end' ? { right: coords.right } : { left: coords.left }),
    ...(matchWidth ? { minWidth: coords.width } : {}),
    maxHeight: coords.maxHeight,
    transform: 'scale(var(--desktop-layout-scale))',
    transformOrigin: `${originY} ${originX}`,
  };

  return createPortal(
    <div
      ref={portalRef}
      className={cn('fixed z-[var(--z-dropdown)] overflow-y-auto', className)}
      style={style}
      data-dropdown-portal
      data-placement={coords.placement}
    >
      {children}
    </div>,
    document.body,
  );
};
