import { Heart, Home, Map, QrCode, ScanLine, UserRound, type LucideIcon } from 'lucide-react';

import { isBuilderPortalPath } from '@/shared/ui/account-mobile-nav-controller';

export type BottomNavLabelKey =
  | 'home'
  | 'discover'
  | 'qr'
  | 'map'
  | 'expoMap'
  | 'builders'
  | 'profile'
  | 'mortgage'
  | 'scanner'
  | 'product';

export type BottomNavId = BottomNavLabelKey;

export type BottomNavItem = {
  id: BottomNavId;
  href: string;
  labelKey: BottomNavLabelKey;
  Icon: LucideIcon;
  match: (pathname: string) => boolean;
  /** Opens overlay instead of navigating (QR / builder scanner). */
  opensSheet?: boolean;
};

const isHomePath = (pathname: string): boolean => pathname === '/';

const isDiscoverPath = (pathname: string): boolean =>
  pathname === '/discover' || pathname.startsWith('/discover/');

const isMapPath = (pathname: string): boolean =>
  pathname === '/map' || pathname.startsWith('/map/');

/**
 * Buyer account / profile shell routes for bottom-nav Profile highlight.
 * Exact `/qr` is the in-profile My QR page (not `/qr/[token]` public landing).
 */
const isProfilePath = (pathname: string): boolean =>
  pathname === '/dashboard' ||
  pathname.startsWith('/dashboard/') ||
  pathname === '/settings' ||
  pathname.startsWith('/settings/') ||
  pathname === '/favorites' ||
  pathname.startsWith('/favorites/') ||
  pathname === '/requests' ||
  pathname.startsWith('/requests/') ||
  pathname === '/checkin' ||
  pathname.startsWith('/checkin/') ||
  pathname.startsWith('/account') ||
  pathname === '/qr';

const isBuilderScannerPath = (pathname: string): boolean =>
  pathname === '/builder/scanner' || pathname.startsWith('/builder/scanner/');

const isBuilderProfilePath = (pathname: string): boolean =>
  isBuilderPortalPath(pathname) && !isBuilderScannerPath(pathname);

/**
 * Same 5 slots for every role: Home · Discover · center sheet · Map · Profile.
 * Center is My QR (buyers/guests) or scanner (builders).
 */
export const buildPublicNavItems = (
  profileHref: string,
  isProfileActive: boolean,
): BottomNavItem[] => [
  {
    id: 'home',
    href: '/',
    labelKey: 'home',
    Icon: Home,
    match: isHomePath,
  },
  {
    id: 'discover',
    href: '/discover',
    labelKey: 'discover',
    Icon: Heart,
    match: isDiscoverPath,
  },
  {
    id: 'qr',
    href: '/qr',
    labelKey: 'qr',
    Icon: QrCode,
    // Highlight only when the bottom-nav sheet is open — not on `/qr` from Profile.
    match: () => false,
    opensSheet: true,
  },
  {
    id: 'map',
    href: '/map',
    labelKey: 'map',
    Icon: Map,
    match: isMapPath,
  },
  {
    id: 'profile',
    href: profileHref,
    labelKey: 'profile',
    Icon: UserRound,
    match: () => isProfileActive,
  },
];

/**
 * Admin bottom nav — Home · Discover · Map · Profile (no QR / scanner).
 */
export const buildAdminNavItems = (isProfileActive: boolean): BottomNavItem[] => [
  {
    id: 'home',
    href: '/',
    labelKey: 'home',
    Icon: Home,
    match: isHomePath,
  },
  {
    id: 'discover',
    href: '/discover',
    labelKey: 'discover',
    Icon: Heart,
    match: isDiscoverPath,
  },
  {
    id: 'map',
    href: '/map',
    labelKey: 'map',
    Icon: Map,
    match: isMapPath,
  },
  {
    id: 'profile',
    href: '/admin',
    labelKey: 'profile',
    Icon: UserRound,
    match: () => isProfileActive,
  },
];

/**
 * Builder bottom nav — same layout as user profile; center opens scanner sheet.
 */
export const BUILDER_NAV_ITEMS: BottomNavItem[] = [
  {
    id: 'home',
    href: '/',
    labelKey: 'home',
    Icon: Home,
    match: isHomePath,
  },
  {
    id: 'discover',
    href: '/discover',
    labelKey: 'discover',
    Icon: Heart,
    match: isDiscoverPath,
  },
  {
    id: 'scanner',
    href: '/builder/scanner',
    labelKey: 'scanner',
    Icon: ScanLine,
    match: isBuilderScannerPath,
    opensSheet: true,
  },
  {
    id: 'map',
    href: '/map',
    labelKey: 'map',
    Icon: Map,
    match: isMapPath,
  },
  {
    id: 'profile',
    href: '/builder',
    labelKey: 'profile',
    Icon: UserRound,
    match: isBuilderProfilePath,
  },
];

export const resolveBuyerProfileActive = (pathname: string): boolean => isProfilePath(pathname);
