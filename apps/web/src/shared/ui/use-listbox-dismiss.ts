import { useEffect, useRef, type RefObject } from 'react';

import { blurActiveElementAfterEscClose } from '@/shared/ui/blur-active-element';
import {
  isInsideDropdownSurface,
  preventWheelDismissThroughDropdown,
} from '@/shared/ui/dropdown-surface';

/**
 * Closes a listbox on outside click, Escape, and (when not contained) scroll.
 */
export const useListboxDismiss = (
  open: boolean,
  contained: boolean,
  rootRef: RefObject<HTMLDivElement | null>,
  menuRef: RefObject<HTMLDivElement | null>,
  setOpen: (open: boolean) => void,
): void => {
  const setOpenRef = useRef(setOpen);
  setOpenRef.current = setOpen;

  useEffect(() => {
    if (!open) {
      return;
    }

    const isInsideOpenMenu = (node: Node): boolean =>
      isInsideDropdownSurface(node, rootRef.current, menuRef.current);

    const onPointerDown = (event: MouseEvent): void => {
      if (isInsideOpenMenu(event.target as Node)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      setOpenRef.current(false);
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      setOpenRef.current(false);
      blurActiveElementAfterEscClose();
    };

    const onScroll = (event: Event): void => {
      const target = event.target;
      if (target instanceof Node && isInsideOpenMenu(target)) {
        return;
      }
      setOpenRef.current(false);
      blurActiveElementAfterEscClose();
    };

    const onWheel = (event: WheelEvent): void => {
      preventWheelDismissThroughDropdown(event, menuRef.current, isInsideOpenMenu);
    };

    document.addEventListener('mousedown', onPointerDown, true);
    window.addEventListener('keydown', onKeyDown, true);
    if (!contained) {
      window.addEventListener('scroll', onScroll, true);
      window.addEventListener('wheel', onWheel, { capture: true, passive: false });
    }
    return () => {
      document.removeEventListener('mousedown', onPointerDown, true);
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('wheel', onWheel, true);
    };
  }, [open, contained, rootRef, menuRef]);
};
