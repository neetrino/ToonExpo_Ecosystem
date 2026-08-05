'use client';

import {
  type CSSProperties,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ACCOUNT_PAGE_PUSH_MS,
  prefersReducedMotion,
} from '@/features/buyer/components/account/account-page-push';

/**
 * Left-edge hit zone — wide enough for thumbs / iOS home-indicator devices.
 * (28px was too tight; swipe often never armed.)
 */
const EDGE_START_MAX_PX = 56;
/** Minimum horizontal travel to commit dismiss. */
const DISMISS_DISTANCE_PX = 72;
/** Fast flick to the right also dismisses. */
const DISMISS_VELOCITY_PX_PER_MS = 0.35;
/** Horizontal wins when dx is at least as large as dy (was stricter 1.15×). */
const AXIS_DECIDE_PX = 6;

type SwipeAxis = 'undecided' | 'horizontal' | 'vertical';

type UseAccountSheetEdgeSwipeOptions = {
  enabled: boolean;
  sheetRef: RefObject<HTMLElement | null>;
  onDismiss: () => void;
};

type UseAccountSheetEdgeSwipeResult = {
  isInteracting: boolean;
  sheetStyle: CSSProperties | undefined;
};

/**
 * Left-edge swipe → drag sheet right → dismiss (browser back gesture style).
 */
export const useAccountSheetEdgeSwipe = ({
  enabled,
  sheetRef,
  onDismiss,
}: UseAccountSheetEdgeSwipeOptions): UseAccountSheetEdgeSwipeResult => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);

  const activeRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);
  const velocityRef = useRef(0);
  const axisRef = useRef<SwipeAxis>('undecided');
  const dragXRef = useRef(0);
  const dismissPendingRef = useRef(false);
  const animationTimerRef = useRef<number | null>(null);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const clearAnimationTimer = useCallback((): void => {
    if (animationTimerRef.current !== null) {
      window.clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }
  }, []);

  const resetVisual = useCallback((): void => {
    dragXRef.current = 0;
    setDragX(0);
    setIsDragging(false);
    setIsSnapping(false);
  }, []);

  const finishDismiss = useCallback((): void => {
    if (dismissPendingRef.current) {
      return;
    }
    dismissPendingRef.current = true;
    setIsDragging(false);
    setIsSnapping(true);

    const width = typeof window !== 'undefined' ? window.innerWidth : 400;
    dragXRef.current = width;
    setDragX(width);

    if (prefersReducedMotion()) {
      onDismissRef.current();
      dismissPendingRef.current = false;
      return;
    }

    clearAnimationTimer();
    animationTimerRef.current = window.setTimeout(() => {
      animationTimerRef.current = null;
      onDismissRef.current();
      // Keep translateX off-screen until the sheet unmounts / disables.
      dismissPendingRef.current = false;
    }, ACCOUNT_PAGE_PUSH_MS);
  }, [clearAnimationTimer]);

  const snapBack = useCallback((): void => {
    setIsDragging(false);
    setIsSnapping(true);
    dragXRef.current = 0;
    setDragX(0);
    clearAnimationTimer();
    animationTimerRef.current = window.setTimeout(() => {
      animationTimerRef.current = null;
      setIsSnapping(false);
    }, ACCOUNT_PAGE_PUSH_MS);
  }, [clearAnimationTimer]);

  useEffect(() => {
    if (!enabled) {
      activeRef.current = false;
      dismissPendingRef.current = false;
      clearAnimationTimer();
      resetVisual();
      return;
    }

    let removeListeners: (() => void) | undefined;
    let rafId = 0;
    let cancelled = false;

    const bind = (): void => {
      if (cancelled) {
        return;
      }
      const el = sheetRef.current;
      if (!el) {
        rafId = window.requestAnimationFrame(bind);
        return;
      }

      const onTouchStart = (event: TouchEvent): void => {
        if (event.touches.length !== 1 || dismissPendingRef.current) {
          return;
        }
        const touch = event.touches[0];
        if (!touch || touch.clientX > EDGE_START_MAX_PX) {
          activeRef.current = false;
          return;
        }
        activeRef.current = true;
        axisRef.current = 'undecided';
        startXRef.current = touch.clientX;
        startYRef.current = touch.clientY;
        lastXRef.current = touch.clientX;
        lastTRef.current = performance.now();
        velocityRef.current = 0;
      };

      const onTouchMove = (event: TouchEvent): void => {
        if (!activeRef.current || event.touches.length !== 1) {
          return;
        }
        const touch = event.touches[0];
        if (!touch) {
          return;
        }

        const dx = touch.clientX - startXRef.current;
        const dy = touch.clientY - startYRef.current;
        const now = performance.now();
        const dt = Math.max(now - lastTRef.current, 1);
        velocityRef.current = (touch.clientX - lastXRef.current) / dt;
        lastXRef.current = touch.clientX;
        lastTRef.current = now;

        if (axisRef.current === 'undecided') {
          if (Math.abs(dx) < AXIS_DECIDE_PX && Math.abs(dy) < AXIS_DECIDE_PX) {
            return;
          }
          // Prefer back-swipe when moving right at least as much as vertically.
          const horizontal = dx > 0 && Math.abs(dx) >= Math.abs(dy);
          axisRef.current = horizontal ? 'horizontal' : 'vertical';
          if (axisRef.current === 'vertical') {
            activeRef.current = false;
            return;
          }
          setIsDragging(true);
          setIsSnapping(false);
        }

        if (axisRef.current !== 'horizontal') {
          return;
        }

        event.preventDefault();
        const nextX = Math.max(0, dx);
        dragXRef.current = nextX;
        setDragX(nextX);
      };

      const onTouchEnd = (): void => {
        if (!activeRef.current) {
          return;
        }
        activeRef.current = false;

        if (axisRef.current !== 'horizontal') {
          axisRef.current = 'undecided';
          return;
        }
        axisRef.current = 'undecided';

        const shouldDismiss =
          dragXRef.current >= DISMISS_DISTANCE_PX ||
          velocityRef.current >= DISMISS_VELOCITY_PX_PER_MS;

        if (shouldDismiss) {
          finishDismiss();
          return;
        }
        snapBack();
      };

      const onTouchCancel = (): void => {
        if (!activeRef.current) {
          return;
        }
        activeRef.current = false;
        if (axisRef.current === 'horizontal') {
          snapBack();
        }
        axisRef.current = 'undecided';
      };

      // Capture so we arm before nested scroll/controls steal the gesture.
      el.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
      el.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
      el.addEventListener('touchend', onTouchEnd, { capture: true });
      el.addEventListener('touchcancel', onTouchCancel, { capture: true });

      removeListeners = () => {
        el.removeEventListener('touchstart', onTouchStart, true);
        el.removeEventListener('touchmove', onTouchMove, true);
        el.removeEventListener('touchend', onTouchEnd, true);
        el.removeEventListener('touchcancel', onTouchCancel, true);
      };
    };

    bind();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      clearAnimationTimer();
      removeListeners?.();
    };
  }, [clearAnimationTimer, enabled, finishDismiss, resetVisual, sheetRef, snapBack]);

  const isInteracting = isDragging || isSnapping;

  const sheetStyle: CSSProperties | undefined = isInteracting
    ? {
        transform: `translate3d(${dragX}px, 0, 0)`,
        transition: isSnapping
          ? `transform ${ACCOUNT_PAGE_PUSH_MS}ms var(--ease-out-premium)`
          : 'none',
        touchAction: isDragging ? 'none' : undefined,
      }
    : undefined;

  return { isInteracting, sheetStyle };
};
