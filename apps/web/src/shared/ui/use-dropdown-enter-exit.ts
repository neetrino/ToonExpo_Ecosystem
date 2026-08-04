'use client';

import { useCallback, useEffect, useState, type AnimationEvent } from 'react';

const DROPDOWN_OUT_ANIMATION_NAME = 'dropdown-panel-out';
/** Slightly longer than CSS out duration so a missed animationend still unmounts. */
const EXIT_FALLBACK_MS = 300;

type UseDropdownEnterExitOptions = {
  open: boolean;
};

type UseDropdownEnterExitResult = {
  isVisible: boolean;
  isExiting: boolean;
  handleAnimationEnd: (event: AnimationEvent<HTMLElement>) => void;
};

/**
 * Keeps a dropdown mounted through its exit animation, then unmounts.
 */
export const useDropdownEnterExit = ({
  open,
}: UseDropdownEnterExitOptions): UseDropdownEnterExitResult => {
  const [isVisible, setIsVisible] = useState(open);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setIsExiting(false);
      return;
    }
    if (isVisible) {
      setIsExiting(true);
    }
  }, [open, isVisible]);

  useEffect(() => {
    if (!isExiting) {
      return;
    }
    const timer = window.setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
    }, EXIT_FALLBACK_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [isExiting]);

  const handleAnimationEnd = useCallback((event: AnimationEvent<HTMLElement>): void => {
    if (event.target !== event.currentTarget) {
      return;
    }
    if (!event.animationName.includes(DROPDOWN_OUT_ANIMATION_NAME)) {
      return;
    }
    setIsVisible(false);
    setIsExiting(false);
  }, []);

  return {
    isVisible,
    isExiting,
    handleAnimationEnd,
  };
};

export const dropdownPanelMotionClass = (
  placement: 'bottom' | 'top',
  isExiting: boolean,
  hasPositioned: boolean,
): string => {
  if (!hasPositioned) {
    return 'opacity-0';
  }
  if (isExiting) {
    return placement === 'top'
      ? 'animate-dropdown-panel-out-top'
      : 'animate-dropdown-panel-out-bottom';
  }
  return placement === 'top' ? 'animate-dropdown-panel-in-top' : 'animate-dropdown-panel-in-bottom';
};
