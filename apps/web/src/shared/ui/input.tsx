import type { InputHTMLAttributes } from "react";

import { cn } from "@/shared/ui/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

/**
 * Baseline text input with soft surface and subtle border.
 */
export const Input = ({ className, type = "text", ...props }: InputProps) => {
  return (
    <input
      type={type}
      className={cn(
        "h-11 w-full rounded-sm border border-border bg-background px-4 text-sm text-ink",
        "placeholder:text-ink-muted",
        "focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
};
