import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/ui/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "md" | "sm";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

const variantClassName: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-on-dark hover:bg-brand/90 focus-visible:ring-brand/40",
  secondary:
    "bg-cta-dark text-on-dark hover:bg-cta-dark/90 focus-visible:ring-cta-dark/30",
  ghost:
    "border border-border-strong bg-transparent text-ink hover:bg-surface focus-visible:ring-border-strong/60",
  danger:
    "bg-danger text-on-dark hover:bg-danger/90 focus-visible:ring-danger/40",
};

const sizeClassName: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-sm",
  sm: "h-9 px-4 text-sm",
};

/**
 * Baseline pill button for auth and shared UI.
 */
export const Button = ({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  disabled,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-pill font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClassName[variant],
        sizeClassName[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
