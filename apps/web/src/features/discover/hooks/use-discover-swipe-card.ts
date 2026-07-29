'use client';

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useRef,
  useState,
} from 'react';

import {
  DISCOVER_SWIPE_COMMIT_PX,
  DISCOVER_SWIPE_COMMIT_VELOCITY,
  DISCOVER_SWIPE_EXIT_MS,
  DISCOVER_SWIPE_MAX_ROTATION_DEG,
} from '@/features/discover/constants';

export type DiscoverSwipeDirection = 'left' | 'right';

export type DiscoverSwipeCommitPayload = {
  direction: DiscoverSwipeDirection;
  fromX: number;
};

type UseDiscoverSwipeCardOptions = {
  enabled: boolean;
  /** Fires immediately on commit — parent advances deck; flyout owns the exit motion. */
  onCommit: (payload: DiscoverSwipeCommitPayload) => void;
};

type UseDiscoverSwipeCardResult = {
  dragX: number;
  isDragging: boolean;
  cardStyle: CSSProperties;
  likeOpacity: number;
  skipOpacity: number;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
  triggerExit: (direction: DiscoverSwipeDirection) => void;
  reset: () => void;
};

const rotationForX = (x: number): number =>
  (Math.max(-DISCOVER_SWIPE_COMMIT_PX, Math.min(DISCOVER_SWIPE_COMMIT_PX, x)) /
    DISCOVER_SWIPE_COMMIT_PX) *
  DISCOVER_SWIPE_MAX_ROTATION_DEG;

/**
 * Horizontal drag / flick for Tinder-style discover cards.
 * Commit hands off exit animation to the parent flyout so the next card never jerks.
 */
export const useDiscoverSwipeCard = ({
  enabled,
  onCommit,
}: UseDiscoverSwipeCardOptions): UseDiscoverSwipeCardResult => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);
  const velocityRef = useRef(0);
  const lockedHorizontalRef = useRef(false);
  const dragXRef = useRef(0);
  const committingRef = useRef(false);

  const reset = useCallback((): void => {
    pointerIdRef.current = null;
    lockedHorizontalRef.current = false;
    committingRef.current = false;
    dragXRef.current = 0;
    setDragX(0);
    setIsDragging(false);
  }, []);

  const finishExit = useCallback(
    (direction: DiscoverSwipeDirection): void => {
      if (committingRef.current) {
        return;
      }
      committingRef.current = true;
      const fromX = dragXRef.current;
      onCommit({ direction, fromX });
      pointerIdRef.current = null;
      lockedHorizontalRef.current = false;
      dragXRef.current = 0;
      setDragX(0);
      setIsDragging(false);
      committingRef.current = false;
    },
    [onCommit],
  );

  const triggerExit = useCallback(
    (direction: DiscoverSwipeDirection): void => {
      if (!enabled || committingRef.current) {
        return;
      }
      finishExit(direction);
    },
    [enabled, finishExit],
  );

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>): void => {
    if (!enabled || committingRef.current || event.button !== 0) {
      return;
    }
    pointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    lockedHorizontalRef.current = false;
    startXRef.current = event.clientX;
    startYRef.current = event.clientY;
    lastXRef.current = event.clientX;
    lastTRef.current = performance.now();
    velocityRef.current = 0;
    setIsDragging(true);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>): void => {
    if (!enabled || committingRef.current || pointerIdRef.current !== event.pointerId) {
      return;
    }

    const dx = event.clientX - startXRef.current;
    const dy = event.clientY - startYRef.current;
    const now = performance.now();
    const dt = Math.max(now - lastTRef.current, 1);
    velocityRef.current = (event.clientX - lastXRef.current) / dt;
    lastXRef.current = event.clientX;
    lastTRef.current = now;

    if (!lockedHorizontalRef.current) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
        return;
      }
      if (Math.abs(dy) > Math.abs(dx) * 1.2) {
        pointerIdRef.current = null;
        setIsDragging(false);
        dragXRef.current = 0;
        setDragX(0);
        return;
      }
      lockedHorizontalRef.current = true;
    }

    event.preventDefault();
    dragXRef.current = dx;
    setDragX(dx);
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLElement>): void => {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }
    pointerIdRef.current = null;
    if (committingRef.current) {
      return;
    }

    if (!lockedHorizontalRef.current) {
      setIsDragging(false);
      return;
    }

    const shouldLike =
      dragXRef.current >= DISCOVER_SWIPE_COMMIT_PX ||
      velocityRef.current >= DISCOVER_SWIPE_COMMIT_VELOCITY;
    const shouldSkip =
      dragXRef.current <= -DISCOVER_SWIPE_COMMIT_PX ||
      velocityRef.current <= -DISCOVER_SWIPE_COMMIT_VELOCITY;

    if (shouldLike) {
      finishExit('right');
      return;
    }
    if (shouldSkip) {
      finishExit('left');
      return;
    }

    setIsDragging(false);
    dragXRef.current = 0;
    setDragX(0);
  };

  const onPointerCancel = (event: ReactPointerEvent<HTMLElement>): void => {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }
    pointerIdRef.current = null;
    if (committingRef.current) {
      return;
    }
    setIsDragging(false);
    dragXRef.current = 0;
    setDragX(0);
  };

  const cardStyle: CSSProperties = {
    transform: `translate3d(${dragX}px, 0, 0) rotate(${rotationForX(dragX)}deg)`,
    transition: isDragging
      ? 'none'
      : `transform ${DISCOVER_SWIPE_EXIT_MS}ms var(--ease-out-premium)`,
    touchAction: 'none',
    willChange: 'transform',
  };

  const likeOpacity = Math.min(1, Math.max(0, dragX / DISCOVER_SWIPE_COMMIT_PX));
  const skipOpacity = Math.min(1, Math.max(0, -dragX / DISCOVER_SWIPE_COMMIT_PX));

  return {
    dragX,
    isDragging,
    cardStyle,
    likeOpacity,
    skipOpacity,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    triggerExit,
    reset,
  };
};

export const buildDiscoverFlyoutStyle = (
  fromX: number,
  direction: DiscoverSwipeDirection,
  exiting: boolean,
  exitPx: number,
): CSSProperties => {
  const x = exiting ? (direction === 'right' ? exitPx : -exitPx) : fromX;
  return {
    transform: `translate3d(${x}px, 0, 0) rotate(${rotationForX(x)}deg)`,
    transition: exiting ? `transform ${DISCOVER_SWIPE_EXIT_MS}ms var(--ease-out-premium)` : 'none',
    pointerEvents: 'none',
    zIndex: 2,
  };
};
