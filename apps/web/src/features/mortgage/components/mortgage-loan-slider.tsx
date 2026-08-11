'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/shared/ui/cn';

type MortgageLoanSliderProps = {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
};

/**
 * Filled-track range control for the public mortgage calculator (Lovable style).
 * Uses local value + `onInput` so metrics update while dragging, not only on release.
 */
export const MortgageLoanSlider = ({
  id,
  label,
  min,
  max,
  step,
  value,
  onChange,
}: MortgageLoanSliderProps) => {
  const [localValue, setLocalValue] = useState(() =>
    Math.min(max, Math.max(min, value)),
  );

  useEffect(() => {
    setLocalValue(Math.min(max, Math.max(min, value)));
  }, [value, min, max]);

  const span = Math.max(max - min, 1);
  const fillPercent = ((localValue - min) / span) * 100;

  const commit = (raw: string) => {
    const next = Math.min(max, Math.max(min, Number(raw)));
    setLocalValue(next);
    onChange(next);
  };

  return (
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={localValue}
      aria-label={label}
      onInput={(event) => {
        commit(event.currentTarget.value);
      }}
      onChange={(event) => {
        commit(event.currentTarget.value);
      }}
      className={cn(
        'mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full',
        'bg-header-border accent-brand-secondary',
        '[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none',
        '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-secondary',
        '[&::-webkit-slider-thumb]:shadow-none',
        '[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full',
        '[&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-brand-secondary',
        '[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-header-border',
      )}
      style={{
        background: `linear-gradient(to right, var(--color-brand-secondary) 0%, var(--color-brand-secondary) ${fillPercent}%, var(--color-header-border) ${fillPercent}%, var(--color-header-border) 100%)`,
      }}
    />
  );
};
