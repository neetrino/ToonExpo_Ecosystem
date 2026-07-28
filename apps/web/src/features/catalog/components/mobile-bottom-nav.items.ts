import { FolderKanban, ScanLine, type LucideIcon } from 'lucide-react';

import { isBuilderPortalPath } from '@/shared/ui/account-mobile-nav-controller';

export type BottomNavLabelKey =
  'home' | 'expoMap' | 'builders' | 'profile' | 'mortgage' | 'scanner' | 'product';

export type BottomNavId = BottomNavLabelKey;

export type BottomNavItem = {
  id: BottomNavId;
  href: string;
  labelKey: BottomNavLabelKey;
  iconClass?: string;
  Icon?: LucideIcon;
  match: (pathname: string) => boolean;
  /** Opens overlay instead of navigating (builder scanner). */
  opensSheet?: boolean;
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

export const buildPublicNavItems = (
  profileHref: string,
  isProfileActive: boolean,
): BottomNavItem[] => [
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

export const BUILDER_NAV_ITEMS: BottomNavItem[] = [
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
    iconClass: maskIcon('profile.webp', 'size-6'),
    match: isBuilderProfilePath,
  },
];

export const resolveBuyerProfileActive = (pathname: string): boolean => isProfilePath(pathname);
