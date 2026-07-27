'use client';

import { useTranslations } from 'next-intl';

import { useMeQuery } from '@/features/auth/hooks/use-auth';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

/** Figma bar fill — no matching design token yet. */
const BAR_SURFACE_CLASS = 'bg-[#171717]';
const BUTTON_SIZE_CLASS = 'size-11';
const ITEM_GAP_CLASS = 'gap-2';
const BAR_PAD_CLASS = 'px-1.5 py-1.5';

const ICON_MASK_BASE =
  'block shrink-0 bg-current [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center] [-webkit-mask-size:contain] [-webkit-mask-repeat:no-repeat] [-webkit-mask-position:center]';

type BottomNavItem = {
  id: 'home' | 'map' | 'builders' | 'profile' | 'mortgage';
  href: string;
  labelKey: 'home' | 'expoMap' | 'builders' | 'profile' | 'mortgage';
  /** Outer icon box + Figma asset mask (leaf sizes from node 134:119). */
  iconClass: string;
  match: (pathname: string) => boolean;
};

const isHomePath = (pathname: string): boolean => pathname === '/';

const isMapPath = (pathname: string): boolean =>
  pathname === '/expo' || pathname.startsWith('/expo/');

const isBuildersPath = (pathname: string): boolean =>
  pathname === '/builders' ||
  pathname.startsWith('/builders/') ||
  pathname === '/developers' ||
  pathname.startsWith('/developers/');

const isProfilePath = (pathname: string): boolean =>
  pathname === '/dashboard' ||
  pathname.startsWith('/dashboard/') ||
  pathname === '/settings' ||
  pathname.startsWith('/settings/') ||
  pathname === '/favorites' ||
  pathname.startsWith('/favorites/') ||
  pathname === '/requests' ||
  pathname.startsWith('/requests/') ||
  pathname === '/qr' ||
  pathname.startsWith('/qr/') ||
  pathname === '/checkin' ||
  pathname.startsWith('/checkin/') ||
  pathname.startsWith('/account');

const isMortgagePath = (pathname: string): boolean =>
  pathname === '/mortgage' || pathname.startsWith('/mortgage/');

/**
 * Mobile-only floating bottom navigation (Figma node 134:119).
 */
export const MobileBottomNav = () => {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const { data: me } = useMeQuery();

  const items: BottomNavItem[] = [
    {
      id: 'home',
      href: '/',
      labelKey: 'home',
      iconClass:
        'size-7 [mask-image:url(/icons/bottom-nav/home.webp)] [-webkit-mask-image:url(/icons/bottom-nav/home.webp)]',
      match: isHomePath,
    },
    {
      id: 'map',
      href: '/expo',
      labelKey: 'expoMap',
      iconClass:
        'size-[26px] [mask-image:url(/icons/bottom-nav/map.webp)] [-webkit-mask-image:url(/icons/bottom-nav/map.webp)]',
      match: isMapPath,
    },
    {
      id: 'builders',
      href: '/builders',
      labelKey: 'builders',
      iconClass:
        'size-6 [mask-image:url(/icons/bottom-nav/builders.webp)] [-webkit-mask-image:url(/icons/bottom-nav/builders.webp)]',
      match: isBuildersPath,
    },
    {
      id: 'profile',
      href: me ? '/dashboard' : '/auth/login',
      labelKey: 'profile',
      iconClass:
        'size-[22px] [mask-image:url(/icons/bottom-nav/profile.webp)] [-webkit-mask-image:url(/icons/bottom-nav/profile.webp)]',
      match: isProfilePath,
    },
    {
      id: 'mortgage',
      href: '/mortgage',
      labelKey: 'mortgage',
      iconClass:
        'size-6 [mask-image:url(/icons/bottom-nav/calculator.webp)] [-webkit-mask-image:url(/icons/bottom-nav/calculator.webp)]',
      match: isMortgagePath,
    },
  ];

  return (
    <nav
      aria-label={t('bottomNav')}
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-0 z-[var(--z-header)] lg:hidden',
        'flex justify-center',
        'pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-2',
      )}
    >
      <div
        className={cn(
          'pointer-events-auto flex w-fit max-w-[calc(100%-1.5rem)] items-center',
          ITEM_GAP_CLASS,
          BAR_PAD_CLASS,
          'rounded-full',
          BAR_SURFACE_CLASS,
        )}
      >
        {items.map((item) => {
          const isActive = item.match(pathname);
          const label = t(item.labelKey);

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'inline-flex shrink-0 items-center justify-center rounded-full transition-colors',
                BUTTON_SIZE_CLASS,
                isActive ? 'bg-brand-secondary text-white' : 'bg-white text-brand-secondary',
              )}
            >
              <span aria-hidden className={cn(ICON_MASK_BASE, item.iconClass)} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

/** Spacer so page content clears the fixed mobile bottom nav. */
export const MobileBottomNavSpacer = () => (
  <div
    className="h-[calc(3.75rem+env(safe-area-inset-bottom,0px))] bg-canvas lg:hidden"
    aria-hidden
  />
);
