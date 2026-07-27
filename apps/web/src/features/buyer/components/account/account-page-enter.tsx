import type { ReactNode } from 'react';

type AccountPageEnterProps = {
  children: ReactNode;
  /**
   * Mobile sub-pages are presented by AccountMobileStack (slide-over panel).
   * Flag kept for call-site clarity; chrome/back live in the stack.
   */
  mobilePush?: boolean | undefined;
};

/**
 * Subtle page entrance wrapper for account section content.
 */
export const AccountPageEnter = ({ children, mobilePush = false }: AccountPageEnterProps) => {
  if (mobilePush) {
    return <div className="flex flex-col gap-6">{children}</div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-[page-enter_var(--duration-base)_var(--ease-out-premium)]">
      {children}
    </div>
  );
};
