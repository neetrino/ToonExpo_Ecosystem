'use client';

import {
  type CSSProperties,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { prefersReducedMotion } from '@/features/buyer/components/account/account-page-push';
import { SIDE_SHEET_PANEL_TRANSITION_MS } from '@/shared/ui/side-sheet.constants';

/** Minimum downward travel to commit dismiss. */
const DISMISS_DISTANCE_PX = 88;
/** Fast flick downward also dismisses. */
const DISMISS_VELOCITY_PX_PER_MS = 0.45;
/** Require clear vertical intent vs horizontal. */
const VERTICAL_LOCK_RATIO = 1.15;
const AXIS_DECIDE_PX = 8;

type SwipeAxis = 'undecided' | 'horizontal' | 'vertical';

type UseBottomSheetSwipeDismissOptions = {
  enabled: boolean;
  sheetRef: RefObject<HTMLElement | null>;
  onDismiss: () => void;
};

type UseBottomSheetSwipeDismissResult = {
  isInteracting: boolean;
  dragY: number;
  sheetStyle: CSSProperties | undefined;
};

/**
 * Drag sheet downward to dismiss (mobile bottom-sheet pattern).
 */
export const useBottomSheetSwipeDismiss = ({
  enabled,
  sheetRef,
  onDismiss,
}: UseBottomSheetSwipeDismissOptions): UseBottomSheetSwipeDismissResult => {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);

  const activeRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const lastYRef = useRef(0);
  const lastTRef = useRef(0);
  const velocityRef = useRef(0);
  const axisRef = useRef<SwipeAxis>('undecided');
  const dragYRef = useRef(0);
  const dismissPendingRef = useRef(false);

  const resetVisual = useCallback((): void => {
    dragYRef.current = 0;
    setDragY(0);
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

    const height = sheetRef.current?.offsetHeight ?? 480;
    dragYRef.current = height;
    setDragY(height);

    if (prefersReducedMotion()) {
      onDismiss();
      dismissPendingRef.current = false;
      return;
    }

    window.setTimeout(() => {
      onDismiss();
      dismissPendingRef.current = false;
      // Keep translateY off-screen until the drawer unmounts.
      // Resetting here snaps the sheet back open for 1–2 frames (page flash).
    }, SIDE_SHEET_PANEL_TRANSITION_MS);
  }, [onDismiss, sheetRef]);

  const snapBack = useCallback((): void => {
    setIsDragging(false);
    setIsSnapping(true);
    dragYRef.current = 0;
    setDragY(0);
    window.setTimeout(() => {
      setIsSnapping(false);
    }, SIDE_SHEET_PANEL_TRANSITION_MS);
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
      if (!touch) {
        return;
      }
      activeRef.current = true;
      axisRef.current = 'undecided';
      startXRef.current = touch.clientX;
      startYRef.current = touch.clientY;
      lastYRef.current = touch.clientY;
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
      velocityRef.current = (touch.clientY - lastYRef.current) / dt;
      lastYRef.current = touch.clientY;
      lastTRef.current = now;

      if (axisRef.current === 'undecided') {
        if (Math.abs(dx) < AXIS_DECIDE_PX && Math.abs(dy) < AXIS_DECIDE_PX) {
          return;
        }
        const vertical = Math.abs(dy) > Math.abs(dx) * VERTICAL_LOCK_RATIO && dy > 0;
        axisRef.current = vertical ? 'vertical' : 'horizontal';
        if (axisRef.current === 'horizontal') {
          activeRef.current = false;
          return;
        }
        setIsDragging(true);
        setIsSnapping(false);
      }

      if (axisRef.current !== 'vertical') {
        return;
      }

      event.preventDefault();
      const nextY = Math.max(0, dy);
      dragYRef.current = nextY;
      setDragY(nextY);
    };

    const onTouchEnd = (): void => {
      if (!activeRef.current) {
        return;
      }
      activeRef.current = false;

      if (axisRef.current !== 'vertical') {
        axisRef.current = 'undecided';
        return;
      }
      axisRef.current = 'undecided';

      const shouldDismiss =
        dragYRef.current >= DISMISS_DISTANCE_PX ||
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
      if (axisRef.current === 'vertical') {
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
        transform: `translate3d(0, ${dragY}px, 0)`,
        transition: isSnapping
          ? `transform ${SIDE_SHEET_PANEL_TRANSITION_MS}ms var(--ease-out-premium)`
          : 'none',
        touchAction: isDragging ? 'none' : undefined,
      }
    : undefined;

  return { isInteracting, dragY, sheetStyle };
};
