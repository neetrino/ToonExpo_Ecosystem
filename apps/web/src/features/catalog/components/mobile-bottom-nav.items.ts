import {
  FolderKanban,
  Heart,
  Home,
  Map,
  QrCode,
  ScanLine,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

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
  /** Opens overlay instead of navigating (builder scanner). */
  opensSheet?: boolean;
};

const isHomePath = (pathname: string): boolean => pathname === '/';

const isDiscoverPath = (pathname: string): boolean =>
  pathname === '/discover' || pathname.startsWith('/discover/');

const isQrPath = (pathname: string): boolean => pathname === '/qr' || pathname.startsWith('/qr/');

const isMapPath = (pathname: string): boolean =>
  pathname === '/expo' || pathname.startsWith('/expo/');

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
  pathname.startsWith('/account');

const isBuilderScannerPath = (pathname: string): boolean =>
  pathname === '/builder/scanner' || pathname.startsWith('/builder/scanner/');

const isBuilderProductPath = (pathname: string): boolean =>
  pathname === '/projects' || pathname.startsWith('/projects/');

const isBuilderProfilePath = (pathname: string): boolean =>
  isBuilderPortalPath(pathname) && !isBuilderScannerPath(pathname);

/**
 * Buyer / guest bottom nav: Home · Discover · QR · Map · Profile.
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
    match: isQrPath,
    opensSheet: true,
  },
  {
    id: 'map',
    href: '/expo',
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

export const BUILDER_NAV_ITEMS: BottomNavItem[] = [
  {
    id: 'home',
    href: '/',
    labelKey: 'home',
    Icon: Home,
    match: isHomePath,
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
    Icon: UserRound,
    match: isBuilderProfilePath,
  },
];

export const resolveBuyerProfileActive = (pathname: string): boolean => isProfilePath(pathname);
