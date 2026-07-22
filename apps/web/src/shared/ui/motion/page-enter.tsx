'use client';

import type { ReactNode } from 'react';
import { useRef } from 'react';

import { usePathname } from '@/i18n/navigation';
import { shouldPlayPageEnter } from '@/shared/ui/motion/motion-session';
import { cn } from '@/shared/ui/cn';

type PageEnterProps = {
  children: ReactNode;
};

/**
 * Plays enter motion on real route changes. Skips it on locale-only switches
 * so content stays put and only translated text updates.
 */
export const PageEnter = ({ children }: PageEnterProps) => {
  const pathname = usePathname();
  const playEnterRef = useRef<boolean | null>(null);

  if (playEnterRef.current === null) {
    playEnterRef.current = shouldPlayPageEnter(pathname);
  }

  return <div className={cn(playEnterRef.current && 'page-enter')}>{children}</div>;
};
