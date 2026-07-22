'use client';

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import {
  isEntranceMotionSettled,
  markEntranceMotionSettled,
} from '@/shared/ui/motion/motion-session';
import { cn } from '@/shared/ui/cn';

const REVEAL_DISTANCE_PX = 16;
const REVEAL_DISTANCE_MOBILE_PX = 10;
const DEFAULT_DURATION_MS = 420;
const MOBILE_BREAKPOINT_PX = 768;

type RevealProps = {
  children: ReactNode;
  className?: string | undefined;
  /** Delay before animation starts (ms). */
  delayMs?: number | undefined;
  /** Animation duration (ms). */
  durationMs?: number | undefined;
  /** When true, only fade (no translate). */
  fadeOnly?: boolean | undefined;
  /** IntersectionObserver rootMargin. */
  rootMargin?: string | undefined;
  as?: 'div' | 'section' | 'article' | 'li' | undefined;
};

/**
 * Viewport reveal: opacity + slight translateY.
 * Skips re-entrance after soft navigations (e.g. locale switch) so only text updates.
 * Initial visibility is always false on SSR; settle/skip runs after mount.
 */
export const Reveal = ({
  children,
  className,
  delayMs = 0,
  durationMs = DEFAULT_DURATION_MS,
  fadeOnly = false,
  rootMargin = '0px 0px -8% 0px',
  as: Tag = 'div',
}: RevealProps) => {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [skipTransition, setSkipTransition] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useLayoutEffect(() => {
    if (!isEntranceMotionSettled()) {
      return;
    }
    setVisible(true);
    setSkipTransition(true);
  }, []);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const widthQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`);

    const sync = () => {
      setReduceMotion(motionQuery.matches);
      setIsMobile(widthQuery.matches);
    };
    sync();

    motionQuery.addEventListener('change', sync);
    widthQuery.addEventListener('change', sync);
    return () => {
      motionQuery.removeEventListener('change', sync);
      widthQuery.removeEventListener('change', sync);
    };
  }, []);

  useEffect(() => {
    if (visible) {
      markEntranceMotionSettled();
      return;
    }

    const node = ref.current;
    if (!node) {
      return;
    }
    if (reduceMotion) {
      setVisible(true);
      markEntranceMotionSettled();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          markEntranceMotionSettled();
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduceMotion, rootMargin, visible]);

  const distance = fadeOnly ? 0 : isMobile ? REVEAL_DISTANCE_MOBILE_PX : REVEAL_DISTANCE_PX;

  const style: CSSProperties | undefined = reduceMotion
    ? undefined
    : {
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate3d(0,0,0)' : `translate3d(0,${distance}px,0)`,
        transitionProperty: skipTransition ? 'none' : 'opacity, transform',
        transitionDuration: `${durationMs}ms`,
        transitionTimingFunction: 'var(--ease-out-premium)',
        transitionDelay: visible && !skipTransition ? `${delayMs}ms` : '0ms',
        willChange: visible ? 'auto' : 'opacity, transform',
      };

  return (
    <Tag
      ref={ref as never}
      className={cn(className)}
      style={style}
      data-revealed={visible ? 'true' : 'false'}
    >
      {children}
    </Tag>
  );
};
