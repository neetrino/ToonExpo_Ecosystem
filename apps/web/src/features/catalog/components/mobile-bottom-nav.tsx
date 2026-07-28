'use client';

import { FolderKanban, QrCode, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useMeQuery } from '@/features/auth/hooks/use-auth';
import { isBuilderPortalPath } from '@/shared/ui/account-mobile-nav-controller';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

/** Figma bar fill — no matching design token yet. */
const BAR_SURFACE_CLASS = 'bg-[#171717]';
const BUTTON_SIZE_CLASS = 'size-12';
const ITEM_GAP_CLASS = 'gap-2';
const BAR_PAD_CLASS = 'p-2';
const THUMB_INSET_CLASS = 'top-2 left-2';
/** Slightly slower than base switchers so the thumb glide reads clearly. */
const THUMB_SLIDE_DURATION_MS = 420;

const ICON_MASK_BASE =
  'block shrink-0 bg-current [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center] [-webkit-mask-size:contain] [-webkit-mask-repeat:no-repeat] [-webkit-mask-position:center]';

/**
 * Sliding thumb offsets — same pattern as ViewModeToggle / AnalyticsDateRangeFilter.
 * Step = thumb width (100%) + gap-2 (0.5rem).
 */
const THUMB_TRANSLATE_BY_INDEX = [
  'translate-x-0',
  'translate-x-[calc(100%+0.5rem)]',
  'translate-x-[calc(200%+1rem)]',
  'translate-x-[calc(300%+1.5rem)]',
  'translate-x-[calc(400%+2rem)]',
] as const;

type BottomNavLabelKey =
  'home' | 'expoMap' | 'builders' | 'profile' | 'mortgage' | 'scanner' | 'product';

type BottomNavId = BottomNavLabelKey;

type BottomNavItem = {
  id: BottomNavId;
  href: string;
  labelKey: BottomNavLabelKey;
  iconClass?: string;
  Icon?: LucideIcon;
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

const isBuilderScannerPath = (pathname: string): boolean =>
  pathname === '/builder/scanner' || pathname.startsWith('/builder/scanner/');

const isBuilderProductPath = (pathname: string): boolean =>
  pathname === '/projects' || pathname.startsWith('/projects/');

const isBuilderProfilePath = (pathname: string): boolean =>
  isBuilderPortalPath(pathname) && !isBuilderScannerPath(pathname);

const maskIcon = (file: string, sizeClass: string): string =>
  `${sizeClass} [mask-image:url(/icons/bottom-nav/${file})] [-webkit-mask-image:url(/icons/bottom-nav/${file})]`;

const PUBLIC_NAV_ITEMS = (profileHref: string, isProfileActive: boolean): BottomNavItem[] => [
  {
    id: 'home',
    href: '/',
    labelKey: 'home',
    iconClass: maskIcon('home.webp', 'size-8'),
    match: isHomePath,
  },
  {
    id: 'expoMap',
    href: '/expo',
    labelKey: 'expoMap',
    iconClass: maskIcon('map.webp', 'size-7'),
    match: isMapPath,
  },
  {
    id: 'builders',
    href: '/builders',
    labelKey: 'builders',
    iconClass: maskIcon('builders.webp', 'size-7'),
    match: isBuildersPath,
  },
  {
    id: 'profile',
    href: profileHref,
    labelKey: 'profile',
    iconClass: maskIcon('profile.webp', 'size-6'),
    match: () => isProfileActive,
  },
  {
    id: 'mortgage',
    href: '/mortgage',
    labelKey: 'mortgage',
    iconClass: maskIcon('calculator.webp', 'size-7'),
    match: isMortgagePath,
  },
];

const BUILDER_NAV_ITEMS: BottomNavItem[] = [
  {
    id: 'home',
    href: '/',
    labelKey: 'home',
    iconClass: maskIcon('home.webp', 'size-8'),
    match: isHomePath,
  },
  {
    id: 'scanner',
    href: '/builder/scanner',
    labelKey: 'scanner',
    Icon: QrCode,
    match: isBuilderScannerPath,
  },
  {
    id: 'product',
    href: '/projects',
    labelKey: 'product',
    Icon: FolderKanban,
    match: isBuilderProductPath,
  },
  {
    id: 'profile',
    href: '/builder',
    labelKey: 'profile',
    iconClass: maskIcon('profile.webp', 'size-6'),
    match: isBuilderProfilePath,
  },
];

/**
 * Mobile-only floating bottom navigation (Figma node 134:119).
 * Builder accounts: Home / Scanner / Product / Profile (all pages).
 * Everyone else: Home / Map / Builders / Profile / Mortgage.
 */
export const MobileBottomNav = () => {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const { data: me } = useMeQuery();
  const [pendingId, setPendingId] = useState<BottomNavId | null>(null);
  const isBuilder = me?.companyType === 'builder';
  const profileHref = isBuilder ? '/builder' : me ? '/dashboard' : '/auth/login';
  const isProfileActive = isBuilder ? isBuilderPortalPath(pathname) : isProfilePath(pathname);

  const items = isBuilder ? BUILDER_NAV_ITEMS : PUBLIC_NAV_ITEMS(profileHref, isProfileActive);

  const routeActiveIndex = items.findIndex((item) => item.match(pathname));
  const pendingIndex = pendingId ? items.findIndex((item) => item.id === pendingId) : -1;
  const activeIndex = pendingIndex >= 0 ? pendingIndex : routeActiveIndex;
  const hasActive = activeIndex >= 0;

  useEffect(() => {
    setPendingId(null);
  }, [pathname]);

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
          'pointer-events-auto relative flex w-fit max-w-[calc(100%-1.5rem)] items-center',
          ITEM_GAP_CLASS,
          BAR_PAD_CLASS,
          'rounded-full',
          BAR_SURFACE_CLASS,
        )}
      >
        {hasActive ? (
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute rounded-full bg-brand-secondary',
              THUMB_INSET_CLASS,
              BUTTON_SIZE_CLASS,
              'transition-transform duration-[var(--bottom-nav-thumb-ms)] ease-[var(--ease-out-premium)]',
              'motion-reduce:transition-none',
              THUMB_TRANSLATE_BY_INDEX[activeIndex],
            )}
            style={{
              ['--bottom-nav-thumb-ms' as string]: `${THUMB_SLIDE_DURATION_MS}ms`,
            }}
          />
        ) : null}

        {items.map((item, index) => {
          const isActive = index === activeIndex;
          const label = t(item.labelKey);
          const Icon = item.Icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => {
                setPendingId(item.id);
              }}
              className={cn(
                'relative z-10 inline-flex shrink-0 items-center justify-center rounded-full',
                'transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-premium)]',
                'motion-reduce:transition-none',
                BUTTON_SIZE_CLASS,
                isActive ? 'text-white' : 'bg-white text-brand-secondary',
              )}
            >
              {Icon ? (
                <Icon className="size-6" strokeWidth={1.75} aria-hidden />
              ) : (
                <span aria-hidden className={cn(ICON_MASK_BASE, item.iconClass)} />
              )}
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
    className="h-[calc(5.5rem+env(safe-area-inset-bottom,0px))] bg-canvas lg:hidden"
    aria-hidden
  />
);
