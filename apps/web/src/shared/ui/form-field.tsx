import type { ReactNode } from "react";

import { cn } from "@/shared/ui/cn";

export type FormFieldProps = {
  id: string;
  label: string;
  error?: string | undefined;
  children: ReactNode;
  className?: string | undefined;
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
}: FormFieldProps) => {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
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
