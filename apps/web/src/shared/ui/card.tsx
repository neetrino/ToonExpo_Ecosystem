import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/ui/cn";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

/**
 * Muted surface card with baseline 16px radius.
 */
export const Card = ({ className, children, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-md bg-surface p-6 shadow-sm sm:p-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
