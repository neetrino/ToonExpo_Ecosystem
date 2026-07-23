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
const MENU_HEIGHT_ESTIMATE_PX = 240;
const STAGE_SELECTOR = '.desktop-fluid-stage';

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

type Align = 'start' | 'end';

type MenuCoords = {
  position: 'absolute' | 'fixed';
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: 'bottom' | 'top';
};

const shouldOpenUpward = (spaceBelow: number, spaceAbove: number, menuHeight: number): boolean => {
  const needed = menuHeight > 0 ? menuHeight : MENU_HEIGHT_ESTIMATE_PX;
  if (spaceBelow >= needed) {
    return false;
  }
  return spaceAbove > spaceBelow;
};

const findStage = (anchor: HTMLElement): HTMLElement | null => {
  return anchor.closest(STAGE_SELECTOR);
};

/** True when the anchor lives under `position: fixed|sticky` chrome (header). */
const hasFixedAncestor = (anchor: HTMLElement, stopAt: HTMLElement | null): boolean => {
  let current: HTMLElement | null = anchor.parentElement;
  while (current && current !== stopAt && current !== document.body) {
    const { position } = getComputedStyle(current);
    if (position === 'fixed' || position === 'sticky') {
      return true;
    }
    current = current.parentElement;
  }
  return false;
};

/**
 * Convert a visual/layout rect pair into stage-local design coordinates.
 * Uses the stage's own width ratio so Safari (pre-26.4) and Chrome agree:
 * both anchor and stage rects are in the same coordinate space.
 */
const toStageLocal = (
  stage: HTMLElement,
  stageRect: DOMRect,
  anchorRect: DOMRect,
): { left: number; top: number; bottom: number; right: number; scale: number } => {
  const layoutWidth = stage.offsetWidth;
  const scale = layoutWidth > 0 ? stageRect.width / layoutWidth : 1;
  const safeScale = Number.isFinite(scale) && scale > 0.01 ? scale : 1;
  return {
    scale: safeScale,
    left: (anchorRect.left - stageRect.left) / safeScale,
    right: (anchorRect.right - stageRect.left) / safeScale,
    top: (anchorRect.top - stageRect.top) / safeScale,
    bottom: (anchorRect.bottom - stageRect.top) / safeScale,
  };
};

const computeMenuCoords = (
  anchor: HTMLElement,
  menu: HTMLDivElement | null,
  align: Align,
): { host: HTMLElement; coords: MenuCoords } | null => {
  const stage = findStage(anchor);
  const anchorRect = anchor.getBoundingClientRect();
  const menuWidth = menu?.offsetWidth ?? 0;
  const menuHeight = menu?.offsetHeight ?? 0;

  // In-flow triggers: portal into the zoomed stage in design px — no transform:scale.
  if (stage && !hasFixedAncestor(anchor, stage)) {
    const stageRect = stage.getBoundingClientRect();
    const local = toStageLocal(stage, stageRect, anchorRect);
    const spaceBelow =
      (stageRect.bottom - anchorRect.bottom) / local.scale - MENU_GAP_PX - VIEWPORT_EDGE_PAD_PX;
    const spaceAbove =
      (anchorRect.top - stageRect.top) / local.scale - MENU_GAP_PX - VIEWPORT_EDGE_PAD_PX;
    const openUp = shouldOpenUpward(spaceBelow, spaceAbove, menuHeight);
    const maxHeight = Math.max(120, openUp ? spaceAbove : spaceBelow);
    const width = menuWidth;
    let left = align === 'end' ? local.right - width : local.left;
    const stageLayoutWidth = stage.offsetWidth;
    left = Math.max(
      VIEWPORT_EDGE_PAD_PX,
      Math.min(left, stageLayoutWidth - VIEWPORT_EDGE_PAD_PX - width),
    );
    const top = openUp
      ? local.top - MENU_GAP_PX - Math.min(menuHeight || MENU_HEIGHT_ESTIMATE_PX, maxHeight)
      : local.bottom + MENU_GAP_PX;

    return {
      host: stage,
      coords: {
        position: 'absolute',
        top,
        left,
        width: anchor.offsetWidth,
        maxHeight,
        placement: openUp ? 'top' : 'bottom',
      },
    };
  }

  // Mobile / no stage / fixed chrome fallback: viewport fixed, no zoom scale.
  const viewH = document.documentElement.clientHeight || window.innerHeight;
  const viewW = document.documentElement.clientWidth || window.innerWidth;
  const spaceBelow = viewH - anchorRect.bottom - MENU_GAP_PX - VIEWPORT_EDGE_PAD_PX;
  const spaceAbove = anchorRect.top - MENU_GAP_PX - VIEWPORT_EDGE_PAD_PX;
  const openUp = shouldOpenUpward(spaceBelow, spaceAbove, menuHeight);
  const maxHeight = Math.max(120, openUp ? spaceAbove : spaceBelow);
  let left = align === 'end' ? anchorRect.right - menuWidth : anchorRect.left;
  left = Math.max(VIEWPORT_EDGE_PAD_PX, Math.min(left, viewW - VIEWPORT_EDGE_PAD_PX - menuWidth));
  const top = openUp
    ? anchorRect.top - MENU_GAP_PX - Math.min(menuHeight || MENU_HEIGHT_ESTIMATE_PX, maxHeight)
    : anchorRect.bottom + MENU_GAP_PX;

  return {
    host: document.body,
    coords: {
      position: 'fixed',
      top,
      left,
      width: anchor.offsetWidth,
      maxHeight,
      placement: openUp ? 'top' : 'bottom',
    },
  };
};

/**
 * Renders a menu above overflow-clipped ancestors.
 *
 * Prefer portaling into `.desktop-fluid-stage` with `position: absolute` in
 * design coordinates so CSS `zoom` is inherited (Safari-safe). Fixed header
 * triggers should keep menus local (`absolute` under a `relative` root) —
 * this portal falls back to unscaled `fixed` on `document.body`.
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
  const [placement, setPlacement] = useState<{ host: HTMLElement; coords: MenuCoords } | null>(
    null,
  );
  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPlacement(null);
      return;
    }

    const update = (): void => {
      const anchor = anchorRef.current;
      if (!anchor) {
        return;
      }
      const next = computeMenuCoords(anchor, portalRef.current, align);
      if (next) {
        setPlacement(next);
      }
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

  if (!mounted || !open || placement == null) {
    return null;
  }

  const { host, coords } = placement;
  const style: CSSProperties = {
    position: coords.position,
    top: coords.top,
    left: coords.left,
    ...(matchWidth ? { minWidth: coords.width } : {}),
    maxHeight: coords.maxHeight,
  };

  return createPortal(
    <div
      ref={portalRef}
      className={cn('z-[var(--z-dropdown)] overflow-y-auto', className)}
      style={style}
      data-dropdown-portal
      data-placement={coords.placement}
    >
      {children}
    </div>,
    host,
  );
};
