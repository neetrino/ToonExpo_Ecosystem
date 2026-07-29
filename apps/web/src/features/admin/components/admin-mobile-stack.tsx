'use client';

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { AdminMobileHub } from '@/features/admin/components/admin-mobile-hub';
import { AdminMobileStackProvider } from '@/features/admin/components/admin-mobile-stack-context';
import { AccountMobileBackLink } from '@/features/buyer/components/account/account-mobile-back-link';
import {
  ACCOUNT_PAGE_PUSH_MS,
  prefersReducedMotion,
} from '@/features/buyer/components/account/account-page-push';
import { useAccountSheetEdgeSwipe } from '@/features/buyer/components/account/use-account-sheet-edge-swipe';
import { usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';
import { MOBILE_BOTTOM_NAV_SHEET_PB_CLASS } from '@/shared/ui/mobile-bottom-nav-clearance';

/** Lets the hub paint before a cold-opened sheet slides over it. */
const HUB_FIRST_PAINT_MS = 80;
const ADMIN_HUB_HREF = '/admin';

type AdminMobileStackProps = {
  name: string;
  email: string;
  children: ReactNode;
};

type PanelAnim = 'in' | 'out';

const scrollWindowToTop = (): void => {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

/**
 * Mobile admin stack: hub always shows first; sub-pages slide over it.
 */
export const AdminMobileStack = ({ name, email, children }: AdminMobileStackProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const isHub = pathname === ADMIN_HUB_HREF;
  const [mounted, setMounted] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [anim, setAnim] = useState<PanelAnim>('in');
  const exitingRef = useRef(false);
  const sawHubRef = useRef(pathname === ADMIN_HUB_HREF);
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
        scrollWindowToTop();
      }
      return;
    }

    if (isHub) {
      setSheetOpen(false);
      sawHubRef.current = true;
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
      return;
    }

    setSheetOpen(false);
    scrollWindowToTop();
    hubFirstTimerRef.current = setTimeout(() => {
      sawHubRef.current = true;
      openSheet();
      hubFirstTimerRef.current = null;
    }, HUB_FIRST_PAINT_MS);
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
      router.replace(ADMIN_HUB_HREF);
      return;
    }

    setAnim('out');
    exitTimerRef.current = setTimeout(() => {
      router.replace(ADMIN_HUB_HREF);
    }, ACCOUNT_PAGE_PUSH_MS);
  }, [isHub, router, sheetOpen]);

  const dismissFromSwipe = useCallback((): void => {
    if (exitingRef.current || isHub || !sheetOpen) {
      return;
    }
    exitingRef.current = true;
    router.replace(ADMIN_HUB_HREF);
  }, [isHub, router, sheetOpen]);

  const showOverlay = mounted && !isHub && sheetOpen;
  const { isInteracting, sheetStyle } = useAccountSheetEdgeSwipe({
    enabled: showOverlay,
    sheetRef: sheetScrollRef,
    onDismiss: dismissFromSwipe,
  });

  return (
    <AdminMobileStackProvider value={{ onBack: showOverlay ? goBack : null }}>
      <div className="md:hidden">
        <AdminMobileHub name={name} email={email} />
      </div>

      <div
        ref={sheetScrollRef}
        style={showOverlay ? sheetStyle : undefined}
        className={cn(
          !showOverlay && 'hidden md:block',
          showOverlay && [
            'max-md:fixed max-md:inset-0 max-md:z-[var(--z-overlay)]',
            'max-md:overflow-x-clip max-md:overflow-y-auto max-md:bg-canvas',
            'max-md:account-sheet-scrollbar max-md:touch-pan-y',
            !isInteracting && (anim === 'out' ? 'account-page-push-out' : 'account-page-push-in'),
          ],
        )}
      >
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
          {showOverlay ? (
            <AccountMobileBackLink onBack={goBack} className="-ml-2 md:hidden" />
          ) : null}
          {children}
        </div>
      </div>
    </AdminMobileStackProvider>
  );
};
