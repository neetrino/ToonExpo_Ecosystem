'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/shared/ui/cn';

export type SegmentedSwitcherOption<T extends string> = {
  value: T;
  label: string;
  icon?: LucideIcon;
};

type SegmentedSwitcherProps<T extends string> = {
  value: T;
  options: readonly SegmentedSwitcherOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean | undefined;
  className?: string | undefined;
  'aria-label': string;
};

type ThumbBox = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const useSlidingThumb = (value: string) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<ThumbBox | null>(null);
  const [enableTransition, setEnableTransition] = useState(false);

  const updateThumb = useCallback((): void => {
    const root = rootRef.current;
    const active = root?.querySelector<HTMLElement>('[aria-checked="true"]');
    if (!root || !active) {
      setThumb(null);
      return;
    }

    const next: ThumbBox = {
      top: active.offsetTop,
      left: active.offsetLeft,
      width: active.offsetWidth,
      height: active.offsetHeight,
    };
    setThumb((prev) =>
      prev &&
      prev.top === next.top &&
      prev.left === next.left &&
      prev.width === next.width &&
      prev.height === next.height
        ? prev
        : next,
    );
  }, []);

  useLayoutEffect(() => {
    updateThumb();
  }, [updateThumb, value]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setEnableTransition(true);
    });
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(() => {
      updateThumb();
    });
    observer.observe(root);
    return () => {
      observer.disconnect();
    };
  }, [updateThumb]);

  return { rootRef, thumb, enableTransition };
};

type SwitcherThumbProps = {
  thumb: ThumbBox | null;
  enableTransition: boolean;
};

const SwitcherThumb = ({ thumb, enableTransition }: SwitcherThumbProps) => {
  const style: CSSProperties | undefined = thumb
    ? { top: thumb.top, left: thumb.left, width: thumb.width, height: thumb.height }
    : undefined;

  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute z-0 rounded-pill bg-cta-dark shadow-xs',
        enableTransition &&
          'transition-[top,left,width,height,opacity] duration-[var(--duration-base)] ease-[var(--ease-out-premium)]',
        'motion-reduce:transition-none',
        thumb ? 'opacity-100' : 'opacity-0',
      )}
      style={style}
    />
  );
};

/**
 * Compact pill switcher — sliding navy thumb on the active option.
 */
export const SegmentedSwitcher = <T extends string>({
  value,
  options,
  onChange,
  disabled = false,
  className,
  'aria-label': ariaLabel,
}: SegmentedSwitcherProps<T>) => {
  const { rootRef, thumb, enableTransition } = useSlidingThumb(value);

  return (
    <div
      ref={rootRef}
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        'relative inline-flex items-center gap-0.5 rounded-pill bg-surface p-1',
        className,
      )}
    >
      <SwitcherThumb thumb={thumb} enableTransition={enableTransition} />
      {options.map((option) => {
        const active = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            className={cn(
              'relative z-10 inline-flex h-9 items-center gap-2 rounded-pill px-4 text-sm font-medium',
              'transition-colors duration-[var(--duration-base)] ease-[var(--ease-out-premium)]',
              'motion-reduce:transition-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-dark/25',
              'disabled:cursor-not-allowed disabled:opacity-50',
              active ? 'text-on-dark' : 'text-ink-muted hover:text-ink',
            )}
            onClick={() => {
              if (!active) {
                onChange(option.value);
              }
            }}
          >
            {Icon ? <Icon className="size-4 shrink-0" strokeWidth={2} aria-hidden /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
