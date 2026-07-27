'use client';

import type { AccountType } from '@toonexpo/contracts';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import { AccountMobileProfileHub } from '@/features/buyer/components/account/account-mobile-profile-hub';
import { AccountMobileStackProvider } from '@/features/buyer/components/account/account-mobile-stack-context';
import {
  ACCOUNT_PAGE_PUSH_MS,
  prefersReducedMotion,
} from '@/features/buyer/components/account/account-page-push';
import { usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type AccountMobileStackProps = {
  name: string;
  email: string;
  accountType: AccountType;
  children: ReactNode;
};

type PanelAnim = 'in' | 'out';

/**
 * Mobile profile stack: hub stays underneath; sub-pages slide over as a full-screen panel.
 * Overlay mounts only after client hydration so a blank panel cannot cover the hub forever.
 */
export const AccountMobileStack = ({
  name,
  email,
  accountType,
  children,
}: AccountMobileStackProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const isHub = pathname === '/dashboard';
  const [mounted, setMounted] = useState(false);
  const [anim, setAnim] = useState<PanelAnim>('in');
  const exitingRef = useRef(false);
  const prevPathRef = useRef(pathname);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current !== null) {
        clearTimeout(exitTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    if (exitingRef.current) {
      if (isHub) {
        exitingRef.current = false;
        prevPathRef.current = pathname;
      }
      return;
    }

    if (isHub) {
      prevPathRef.current = pathname;
      return;
    }

    if (prevPathRef.current !== pathname) {
      setAnim('in');
    }
    prevPathRef.current = pathname;
  }, [isHub, mounted, pathname]);

  const goBack = (): void => {
    if (exitingRef.current || isHub) {
      return;
    }
    exitingRef.current = true;

    if (prefersReducedMotion()) {
      router.replace('/dashboard');
      return;
    }

    setAnim('out');
    exitTimerRef.current = setTimeout(() => {
      router.replace('/dashboard');
    }, ACCOUNT_PAGE_PUSH_MS);
  };

  const showOverlay = mounted && !isHub;

  return (
    <AccountMobileStackProvider value={{ onBack: showOverlay ? goBack : null }}>
      <div className="md:hidden">
        <AccountMobileProfileHub name={name} email={email} accountType={accountType} />
      </div>

      <div
        className={cn(
          !showOverlay && 'hidden md:block',
          showOverlay && [
            'max-md:fixed max-md:inset-0 max-md:z-[var(--z-overlay)]',
            'max-md:overflow-x-clip max-md:overflow-y-auto max-md:bg-canvas',
            'max-md:account-sheet-scrollbar',
            anim === 'out' ? 'account-page-push-out' : 'account-page-push-in',
          ],
        )}
      >
        {showOverlay ? (
          <div
            className={cn(
              'flex flex-col gap-6',
              'max-md:mx-auto max-md:w-full max-md:max-w-md',
              'max-md:px-[var(--page-gutter)] max-md:pt-5',
              'max-md:pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]',
            )}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </AccountMobileStackProvider>
  );
};
