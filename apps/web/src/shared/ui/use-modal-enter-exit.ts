'use client';

import { useCallback, useEffect, useState, type AnimationEvent } from 'react';

import { lockBodyScroll, unlockBodyScroll } from '@/shared/ui/body-scroll-lock';

const PANEL_OUT_ANIMATION_NAME = 'admin-delete-modal-panel-out';
const EXIT_FALLBACK_MS = 320;

type UseModalEnterExitOptions = {
  isOpen: boolean;
  lockScroll?: boolean | undefined;
};

type UseModalEnterExitResult = {
  isVisible: boolean;
  isExiting: boolean;
  backdropMotionClass: string;
  panelMotionClass: string;
  handlePanelAnimationEnd: (event: AnimationEvent<HTMLElement>) => void;
};

/**
 * MaMarie-style modal enter/exit: keep mounted through exit, swap in/out classes.
 */
export const useModalEnterExit = ({
  isOpen,
  lockScroll = true,
}: UseModalEnterExitOptions): UseModalEnterExitResult => {
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!lockScroll || !isVisible) {
      return;
    }
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [isVisible, lockScroll]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsExiting(false);
      return;
    }
    if (isVisible) {
      setIsExiting(true);
    }
  }, [isOpen, isVisible]);

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

  const handlePanelAnimationEnd = useCallback((event: AnimationEvent<HTMLElement>): void => {
    if (event.target !== event.currentTarget) {
      return;
    }
    if (!event.animationName.includes(PANEL_OUT_ANIMATION_NAME)) {
      return;
    }
    setIsVisible(false);
    setIsExiting(false);
  }, []);

  return {
    isVisible,
    isExiting,
    backdropMotionClass: isExiting
      ? 'animate-admin-delete-modal-backdrop-out'
      : 'animate-admin-delete-modal-backdrop-in',
    panelMotionClass: isExiting
      ? 'animate-admin-delete-modal-panel-out'
      : 'animate-admin-delete-modal-panel-in',
    handlePanelAnimationEnd,
  };
};
