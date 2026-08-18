'use client';

import { useState, type FormEvent } from 'react';

import { Button } from '@/shared/ui/button';

import { MAX_FLOOR_COUNT, MIN_FLOOR_COUNT } from '../constants';

export type BuildingFloorSetupFormProps = {
  buildingName: string;
  initialFloorCount: number;
  submitLabel: string;
  pendingLabel?: string;
  floorCountLabel: string;
  hint: string;
  onSubmit: (floorCount: number) => Promise<void>;
};

/**
 * Floor-count setup before building render mapping.
 */
export const BuildingFloorSetupForm = ({
  buildingName,
  initialFloorCount,
  submitLabel,
  pendingLabel,
  floorCountLabel,
  hint,
  onSubmit,
}: BuildingFloorSetupFormProps) => {
  const [floorCount, setFloorCount] = useState(
    String(Math.max(initialFloorCount, MIN_FLOOR_COUNT)),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const count = Number(floorCount);
    if (!Number.isInteger(count) || count < MIN_FLOOR_COUNT || count > MAX_FLOOR_COUNT) {
      setError(`${MIN_FLOOR_COUNT}–${MAX_FLOOR_COUNT}`);
      return;
    }
    setPending(true);
    setError(null);
    try {
      await onSubmit(count);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Error');
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      className="mt-4 space-y-3 rounded-sm border border-border bg-background p-3"
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
    >
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink">
        Setup · {buildingName}
      </p>
      <p className="text-xs text-ink-muted">{hint}</p>
      <label className="block space-y-1 text-xs text-ink-muted">
        <span className="uppercase tracking-[0.14em]">{floorCountLabel}</span>
        <input
          type="number"
          min={MIN_FLOOR_COUNT}
          max={MAX_FLOOR_COUNT}
          required
          value={floorCount}
          onChange={(event) => setFloorCount(event.target.value)}
          className="w-full rounded-sm border border-border bg-background px-3 py-2 text-base text-ink lg:text-sm"
        />
      </label>
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="sm" disabled={pending} className="w-full">
        {pending ? (pendingLabel ?? submitLabel) : submitLabel}
      </Button>
    </form>
  );
};
