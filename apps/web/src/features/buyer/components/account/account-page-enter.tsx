import type { ReactNode } from 'react';

/**
 * Subtle page entrance wrapper for account section content.
 */
export const AccountPageEnter = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col gap-6 animate-[page-enter_var(--duration-base)_var(--ease-out-premium)]">
      {children}
    </div>
  );
};
