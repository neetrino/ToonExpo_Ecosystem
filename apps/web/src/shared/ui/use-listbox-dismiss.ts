import { useEffect, useRef, type RefObject } from 'react';

import { blurActiveElementAfterEscClose } from '@/shared/ui/blur-active-element';

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

    const isInsideOpenMenu = (node: Node): boolean => {
      if (rootRef.current?.contains(node) || menuRef.current?.contains(node)) {
        return true;
      }
      if (node instanceof Element && menuRef.current) {
        const portal = node.closest('[data-dropdown-portal]');
        return Boolean(portal?.contains(menuRef.current));
      }
      return false;
    };

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

    document.addEventListener('mousedown', onPointerDown, true);
    window.addEventListener('keydown', onKeyDown, true);
    if (!contained) {
      window.addEventListener('scroll', onScroll, true);
    }
    return () => {
      document.removeEventListener('mousedown', onPointerDown, true);
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open, contained, rootRef, menuRef]);
};
