import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/cn';

type ErrorStateProps = {
  title: string;
  description?: string | undefined;
  retryLabel?: string | undefined;
  onRetry?: (() => void) | undefined;
  className?: string | undefined;
  children?: ReactNode | undefined;
};

/**
 * Inline error presentation for failed queries / mutations.
 */
export const ErrorState = ({
  title,
  description,
  retryLabel,
  onRetry,
  className,
  children,
}: ErrorStateProps) => {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-md border border-danger/20 bg-danger-soft px-6 py-10 text-center',
        className,
      )}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-surface-elevated text-danger shadow-xs">
        <AlertTriangle className="size-5" aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-secondary">{description}</p>
      ) : null}
      {retryLabel && onRetry ? (
        <Button className="mt-6" size="sm" variant="outline" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
      {children}
    </div>
  );
};
