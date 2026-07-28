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

/** Browser-like back gesture: start near the left screen edge. */
const EDGE_START_MAX_PX = 28;
/** Minimum horizontal travel to commit dismiss. */
const DISMISS_DISTANCE_PX = 96;
/** Fast flick to the right also dismisses. */
const DISMISS_VELOCITY_PX_PER_MS = 0.4;
/** Require clear horizontal intent vs vertical scroll. */
const HORIZONTAL_LOCK_RATIO = 1.15;
const AXIS_DECIDE_PX = 8;

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
      onDismiss();
      dismissPendingRef.current = false;
      resetVisual();
      return;
    }

    window.setTimeout(() => {
      onDismiss();
      dismissPendingRef.current = false;
      resetVisual();
    }, ACCOUNT_PAGE_PUSH_MS);
  }, [onDismiss, resetVisual]);

  const snapBack = useCallback((): void => {
    setIsDragging(false);
    setIsSnapping(true);
    dragXRef.current = 0;
    setDragX(0);
    window.setTimeout(() => {
      setIsSnapping(false);
    }, ACCOUNT_PAGE_PUSH_MS);
  }, []);

  useEffect(() => {
    if (!enabled) {
      activeRef.current = false;
      resetVisual();
      return;
    }

    const el = sheetRef.current;
    if (!el) {
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
        const horizontal = Math.abs(dx) > Math.abs(dy) * HORIZONTAL_LOCK_RATIO && dx > 0;
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

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchCancel);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [enabled, finishDismiss, resetVisual, sheetRef, snapBack]);

  const isInteracting = isDragging || isSnapping;

  const sheetStyle: CSSProperties | undefined = isInteracting
    ? {
        transform: `translate3d(${dragX}px, 0, 0)`,
        opacity: Math.max(0.88, 1 - dragX / 600),
        transition: isSnapping
          ? `transform ${ACCOUNT_PAGE_PUSH_MS}ms var(--ease-out-premium), opacity ${ACCOUNT_PAGE_PUSH_MS}ms var(--ease-out-premium)`
          : 'none',
        touchAction: isDragging ? 'none' : undefined,
      }
    : undefined;

  return { isInteracting, sheetStyle };
};
