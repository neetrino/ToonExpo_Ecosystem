'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { usePathname } from '@/i18n/navigation';
import { shouldPlayPageEnter } from '@/shared/ui/motion/motion-session';
import { cn } from '@/shared/ui/cn';

type PageEnterProps = {
  children: ReactNode;
};

/**
 * Plays enter motion on real route changes. Skips it on locale-only switches.
 * Decision runs only after mount to avoid SSR/client hydration mismatches.
 */
export const PageEnter = ({ children }: PageEnterProps) => {
  const pathname = usePathname();
  const [playEnter, setPlayEnter] = useState(false);

  useEffect(() => {
    setPlayEnter(shouldPlayPageEnter(pathname));
  }, [pathname]);

  return <div className={cn(playEnter && 'page-enter')}>{children}</div>;
};
