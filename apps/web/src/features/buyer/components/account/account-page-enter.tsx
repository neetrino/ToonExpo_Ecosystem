'use client';

import type { ReactNode } from 'react';

import { LIST_CONTENT_BASE_DELAY_MS, Reveal } from '@/shared/ui/motion';

type AccountPageEnterProps = {
  children: ReactNode;
  /**
   * Mobile sub-pages are presented by AccountMobileStack (slide-over panel).
   * Flag kept for call-site clarity; chrome/back live in the stack.
   */
  mobilePush?: boolean | undefined;
};

/**
 * Account section layout shell. Entrance motion lives on header + content reveals.
 */
export const AccountPageEnter = ({ children }: AccountPageEnterProps) => {
  return <div className="flex flex-col gap-6">{children}</div>;
};

type AccountContentRevealProps = {
  children: ReactNode;
};

/**
 * Content block entrance — same delay as admin/builder list pages after the title.
 */
export const AccountContentReveal = ({ children }: AccountContentRevealProps) => {
  return (
    <Reveal force delayMs={LIST_CONTENT_BASE_DELAY_MS}>
      {children}
    </Reveal>
  );
};
