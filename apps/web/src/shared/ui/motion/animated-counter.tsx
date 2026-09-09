'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import {
  isEntranceMotionSettled,
  markEntranceMotionSettled,
} from '@/shared/ui/motion/motion-session';
import { cn } from '@/shared/ui/cn';

const DEFAULT_DURATION_MS = 900;

export type AnimatedCounterFormatStyle = 'integer' | 'currencyAmd';

type AnimatedCounterProps = {
  value: number;
  className?: string | undefined;
  durationMs?: number | undefined;
  /**
   * Serializable format kind for Server → Client boundaries.
   * Prefer this over a function formatter from RSC parents.
   */
  formatStyle?: AnimatedCounterFormatStyle | undefined;
  /** BCP 47 locale; selects the digit grouping separator for `formatStyle`. */
  locale?: string | undefined;
};

/**
 * Counts up when first visible. On soft navigations (locale switch) shows the
 * final value immediately so only formatted text changes.
 * Mount state is hydration-safe (no module flags during render).
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
  const [settledOnMount, setSettledOnMount] = useState(false);
  const format = createFormatter(formatStyle, locale);

  useLayoutEffect(() => {
    if (!isEntranceMotionSettled()) {
      return;
    }
    setSettledOnMount(true);
    setDisplay(value);
    setStarted(true);
  }, [value]);

  useEffect(() => {
    if (settledOnMount) {
      setDisplay(value);
      return;
    }

    const node = ref.current;
    if (!node) {
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      setDisplay(value);
      setStarted(true);
      markEntranceMotionSettled();
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
  }, [value, settledOnMount]);

  useEffect(() => {
    if (!started || settledOnMount) {
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setDisplay(value);
      markEntranceMotionSettled();
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
      } else {
        markEntranceMotionSettled();
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, value, durationMs, settledOnMount]);

  return (
    <span ref={ref} className={cn(className)} aria-label={format(value)}>
      {format(display)}
    </span>
  );
};

const NBSP_GROUP_SEPARATOR = '\u00a0';
const COMMA_GROUP_SEPARATOR = ',';
const AMD_CURRENCY_SYMBOL = '֏';

/** Base languages that group thousands with a comma (`hy` / `ru` use NBSP). */
const COMMA_GROUPING_LANGUAGES = new Set(['en']);

/**
 * Groups thousands with a fixed separator instead of `Intl.NumberFormat`.
 * Node and browser ICU disagree on when to group (e.g. `hy` skips grouping
 * below five digits), which breaks hydration for server-rendered counters.
 */
const groupThousands = (value: number, separator: string): string => {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};

const resolveGroupSeparator = (locale: string): string => {
  const [language = ''] = locale.toLowerCase().split('-');
  return COMMA_GROUPING_LANGUAGES.has(language) ? COMMA_GROUP_SEPARATOR : NBSP_GROUP_SEPARATOR;
};

const formatAmdCurrency = (value: number): string => {
  const grouped = groupThousands(value, NBSP_GROUP_SEPARATOR);
  return `${grouped}${NBSP_GROUP_SEPARATOR}${AMD_CURRENCY_SYMBOL}`;
};

const createFormatter = (
  formatStyle: AnimatedCounterFormatStyle,
  locale: string,
): ((n: number) => string) => {
  if (formatStyle === 'currencyAmd') {
    return (n) => formatAmdCurrency(n);
  }

  const separator = resolveGroupSeparator(locale);
  return (n) => groupThousands(n, separator);
};
