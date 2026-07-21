import type { ReactNode } from 'react';

import { cn } from '@/shared/ui/cn';

export type FormFieldProps = {
  id: string;
  label: string;
  error?: string | undefined;
  children: ReactNode;
  className?: string | undefined;
  labelClassName?: string | undefined;
};

/**
 * Label + control + optional validation message wrapper.
 */
export const FormField = ({
  id,
  label,
  error,
  children,
  className,
  labelClassName,
}: FormFieldProps) => {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className={cn('text-sm font-medium text-ink', labelClassName)}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
};
