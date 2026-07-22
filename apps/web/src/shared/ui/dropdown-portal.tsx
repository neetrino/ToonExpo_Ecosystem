'use client';

import {
  useEffect,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/shared/ui/cn';

const MENU_GAP_PX = 8;

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
  top: number;
  left: number;
  width: number;
  align: 'start' | 'end';
};

/**
 * Renders a menu in `document.body` with fixed coords so it stacks above
 * overflow-clipped parents, cards, and the header.
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
      setCoords({
        top: rect.bottom + MENU_GAP_PX,
        left: align === 'end' ? rect.right : rect.left,
        width: rect.width,
        align,
      });
    };

    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, anchorRef, align]);

  if (!mounted || !open || coords == null) {
    return null;
  }

  const style: CSSProperties = {
    top: coords.top,
    ...(coords.align === 'end'
      ? { right: `calc(100vw - ${coords.left}px)` }
      : { left: coords.left }),
    ...(matchWidth ? { minWidth: coords.width } : {}),
  };

  return createPortal(
    <div
      className={cn('fixed z-[var(--z-dropdown)]', className)}
      style={style}
      data-dropdown-portal
    >
      {children}
    </div>,
    document.body,
  );
};
