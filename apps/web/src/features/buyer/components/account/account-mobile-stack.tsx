'use client';

import type { AccountType } from '@toonexpo/contracts';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { AccountMobileProfileHub } from '@/features/buyer/components/account/account-mobile-profile-hub';
import { AccountMobileStackProvider } from '@/features/buyer/components/account/account-mobile-stack-context';
import {
  ACCOUNT_PAGE_PUSH_MS,
  prefersReducedMotion,
} from '@/features/buyer/components/account/account-page-push';
import { useAccountSheetEdgeSwipe } from '@/features/buyer/components/account/use-account-sheet-edge-swipe';
import { usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';
import { MOBILE_BOTTOM_NAV_SHEET_PB_CLASS } from '@/shared/ui/mobile-bottom-nav-clearance';

/** Lets the profile hub paint before a cold-opened sheet slides over it. */
const HUB_FIRST_PAINT_MS = 80;

type AccountMobileStackProps = {
  name: string;
  email: string;
  accountType: AccountType;
  children: ReactNode;
};

type PanelAnim = 'in' | 'out';

const scrollWindowToTop = (): void => {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

/**
 * Mobile profile stack: hub always shows first; sub-pages slide over it.
 * Scroll position resets on every hub/sheet open so pages start from the top.
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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [anim, setAnim] = useState<PanelAnim>('in');
  const exitingRef = useRef(false);
  const prevPathRef = useRef(pathname);
  const sawHubRef = useRef(pathname === '/dashboard');
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hubFirstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sheetScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current !== null) {
        clearTimeout(exitTimerRef.current);
      }
      if (hubFirstTimerRef.current !== null) {
        clearTimeout(hubFirstTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    if (hubFirstTimerRef.current !== null) {
      clearTimeout(hubFirstTimerRef.current);
      hubFirstTimerRef.current = null;
    }

    if (exitingRef.current) {
      if (isHub) {
        exitingRef.current = false;
        setSheetOpen(false);
        sawHubRef.current = true;
        prevPathRef.current = pathname;
        scrollWindowToTop();
      }
      return;
    }

    if (isHub) {
      setSheetOpen(false);
      sawHubRef.current = true;
      prevPathRef.current = pathname;
      scrollWindowToTop();
      return;
    }

    const openSheet = (): void => {
      setAnim('in');
      setSheetOpen(true);
      scrollWindowToTop();
      requestAnimationFrame(() => {
        if (sheetScrollRef.current) {
          sheetScrollRef.current.scrollTop = 0;
        }
      });
    };

    if (sawHubRef.current) {
      openSheet();
      prevPathRef.current = pathname;
      return;
    }

    setSheetOpen(false);
    scrollWindowToTop();
    hubFirstTimerRef.current = setTimeout(() => {
      sawHubRef.current = true;
      openSheet();
      hubFirstTimerRef.current = null;
    }, HUB_FIRST_PAINT_MS);
    prevPathRef.current = pathname;
  }, [isHub, mounted, pathname]);

  useEffect(() => {
    if (!sheetOpen) {
      return;
    }
    if (sheetScrollRef.current) {
      sheetScrollRef.current.scrollTop = 0;
    }
  }, [pathname, sheetOpen]);

  const goBack = useCallback((): void => {
    if (exitingRef.current || isHub || !sheetOpen) {
      return;
    }
    exitingRef.current = true;
    scrollWindowToTop();

    if (prefersReducedMotion()) {
      router.replace('/dashboard');
      return;
    }

    setAnim('out');
    exitTimerRef.current = setTimeout(() => {
      router.replace('/dashboard');
    }, ACCOUNT_PAGE_PUSH_MS);
  }, [isHub, router, sheetOpen]);

  /** Swipe already animated the sheet off-screen — navigate without push-out. */
  const dismissFromSwipe = useCallback((): void => {
    if (exitingRef.current || isHub || !sheetOpen) {
      return;
    }
    exitingRef.current = true;
    router.replace('/dashboard');
  }, [isHub, router, sheetOpen]);

  const showOverlay = mounted && !isHub && sheetOpen;
  const { isInteracting, sheetStyle } = useAccountSheetEdgeSwipe({
    enabled: showOverlay,
    sheetRef: sheetScrollRef,
    onDismiss: dismissFromSwipe,
  });

  return (
    <AccountMobileStackProvider value={{ onBack: showOverlay ? goBack : null }}>
      <div className="md:hidden">
        <AccountMobileProfileHub name={name} email={email} accountType={accountType} />
      </div>

      <div
        ref={sheetScrollRef}
        style={showOverlay ? sheetStyle : undefined}
        className={cn(
          !showOverlay && 'hidden md:block',
          showOverlay && [
            'max-md:fixed max-md:inset-0 max-md:z-[var(--z-overlay)]',
            'max-md:overflow-x-clip max-md:overflow-y-auto max-md:bg-canvas',
            'max-md:account-sheet-scrollbar',
            !isInteracting && (anim === 'out' ? 'account-page-push-out' : 'account-page-push-in'),
          ],
        )}
      >
        {/* Keep a stable children tree — toggling showOverlay must not remount forms. */}
        <div
          className={cn(
            'flex flex-col gap-6',
            showOverlay && [
              'max-md:mx-auto max-md:w-full max-md:max-w-md',
              'max-md:px-[var(--page-gutter)] max-md:pt-5',
              MOBILE_BOTTOM_NAV_SHEET_PB_CLASS,
            ],
          )}
        >
          {children}
        </div>
      </div>
    </AccountMobileStackProvider>
  );
};
