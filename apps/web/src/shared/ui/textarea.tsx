import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/shared/ui/cn";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * Baseline multiline input matching {@link Input} surface styles.
 */
export const Textarea = ({ className, rows = 4, ...props }: TextareaProps) => {
  return (
    <textarea
      rows={rows}
      className={cn(
        "w-full rounded-sm border border-border bg-background px-4 py-3 text-sm text-ink",
        "placeholder:text-ink-muted",
        "focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
};
