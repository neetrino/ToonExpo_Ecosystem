'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/ui/cn';

const DEFAULT_DURATION_MS = 900;

export type AnimatedCounterFormatStyle = 'integer' | 'currencyUsd';

type AnimatedCounterProps = {
  value: number;
  className?: string | undefined;
  durationMs?: number | undefined;
  /**
   * Serializable format kind for Server → Client boundaries.
   * Prefer this over a function formatter from RSC parents.
   */
  formatStyle?: AnimatedCounterFormatStyle | undefined;
  /** BCP 47 locale used with `formatStyle`. */
  locale?: string | undefined;
};

/**
 * Counts up when first visible. Skips animation under reduced motion.
 */
export const AnimatedCounter = ({
  value,
  className,
  durationMs = DEFAULT_DURATION_MS,
  formatStyle = 'integer',
  locale = 'en',
}: AnimatedCounterProps) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);
  const format = createFormatter(formatStyle, locale);

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

const createFormatter = (
  formatStyle: AnimatedCounterFormatStyle,
  locale: string,
): ((n: number) => string) => {
  if (formatStyle === 'currencyUsd') {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });
    return (n) => formatter.format(Math.round(n));
  }

  const formatter = new Intl.NumberFormat(locale);
  return (n) => formatter.format(Math.round(n));
};
