'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/ui/cn';

const DEFAULT_DURATION_MS = 900;

type AnimatedCounterProps = {
  value: number;
  className?: string | undefined;
  durationMs?: number | undefined;
  /** Optional formatter (locale-aware). */
  format?: ((n: number) => string) | undefined;
};

/**
 * Counts up when first visible. Skips animation under reduced motion.
 */
export const AnimatedCounter = ({
  value,
  className,
  durationMs = DEFAULT_DURATION_MS,
  format = (n) => String(Math.round(n)),
}: AnimatedCounterProps) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      setDisplay(value);
      setStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  useEffect(() => {
    if (!started) {
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const from = 0;
    const to = value;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, value, durationMs]);

  return (
    <span ref={ref} className={cn(className)} aria-label={format(value)}>
      {format(display)}
    </span>
  );
};
