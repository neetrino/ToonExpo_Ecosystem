'use client';

import type { InteractiveMappingPhaseStatus } from '@toonexpo/contracts';

import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';
import { LIST_CARD_LIFT_CLASS } from '@/shared/ui/motion';

export type PhaseCardProps = {
  step: number;
  title: string;
  hint: string;
  state: InteractiveMappingPhaseStatus;
  statusLabel: string;
  addHref?: string | undefined;
  addLabel?: string | undefined;
  doneLabel?: string | undefined;
  lockedLabel?: string | undefined;
};

/**
 * Locked / active / done phase card for the interactive-mapping wizard.
 */
export const PhaseCard = ({
  step,
  title,
  hint,
  state,
  statusLabel,
  addHref,
  addLabel,
  doneLabel,
  lockedLabel,
}: PhaseCardProps) => {
  const locked = state === 'locked';
  const done = state === 'done';
  const active = state === 'active';

  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-sm border border-border bg-background p-5',
        LIST_CARD_LIFT_CLASS,
        active && 'border-border-strong',
        locked && 'opacity-55',
      )}
      aria-current={active ? 'step' : undefined}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-sm',
                done && 'border-success bg-success-soft text-success',
                active && 'border-ink bg-ink text-on-dark',
              )}
            >
              {done ? '✓' : step}
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">
                {statusLabel}
              </p>
              <h2 className="font-display text-2xl text-ink">{title}</h2>
            </div>
          </div>
          <p className="mt-3 max-w-xl text-sm text-ink-muted">{hint}</p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[220px]">
          {active && addHref && addLabel ? (
            <Link
              href={addHref}
              className="inline-flex items-center justify-center rounded-[15px] border border-ink bg-ink px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-on-dark transition hover:bg-transparent hover:text-ink"
            >
              {addLabel}
            </Link>
          ) : null}

          {done && addHref ? (
            <Link
              href={addHref}
              className="inline-flex items-center justify-center rounded-[15px] border border-border px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-ink transition hover:bg-surface"
            >
              {doneLabel ?? addLabel}
            </Link>
          ) : null}

          {locked ? (
            <span className="inline-flex items-center justify-center rounded-[15px] border border-dashed border-border px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-ink-muted">
              {lockedLabel}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
};
