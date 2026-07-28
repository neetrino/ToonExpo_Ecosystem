import type { LucideIcon } from 'lucide-react';
import {
  Building,
  Building2,
  CalendarDays,
  ClipboardCheck,
  FolderKanban,
  Handshake,
  Home,
  Landmark,
  Layers,
  LayoutList,
  LineChart,
  Settings,
  Tags,
  Users,
  Workflow,
} from 'lucide-react';

export type AdminNavItemKey =
  | 'analytics'
  | 'companies'
  | 'users'
  | 'projects'
  | 'buildings'
  | 'floors'
  | 'apartments'
  | 'partners'
  | 'bankOffers'
  | 'serviceProviders'
  | 'readiness'
  | 'readinessCategories'
  | 'bos'
  | 'events'
  | 'settings';

export type AdminNavItem = {
  href: string;
  key: AdminNavItemKey;
  icon: LucideIcon;
  children?: AdminNavItem[];
};

const PROJECTS_HREF = '/admin/projects';
const READINESS_HREF = '/admin/readiness';
const SERVICE_PROVIDERS_HREF = '/admin/service-providers';
const BOS_HREF = '/admin/integrations/bos';

export const ADMIN_PROJECT_CHILD_NAV_ITEMS: AdminNavItem[] = [
  { href: '/admin/projects/buildings', key: 'buildings', icon: Building },
  { href: '/admin/projects/floors', key: 'floors', icon: Layers },
  { href: '/admin/projects/apartments', key: 'apartments', icon: Home },
];

export const ADMIN_READINESS_CHILD_NAV_ITEMS: AdminNavItem[] = [
  { href: SERVICE_PROVIDERS_HREF, key: 'serviceProviders', icon: LayoutList },
  { href: '/admin/readiness/categories', key: 'readinessCategories', icon: Tags },
];

export const ADMIN_SETTINGS_CHILD_NAV_ITEMS: AdminNavItem[] = [
  { href: BOS_HREF, key: 'bos', icon: Workflow },
];

export const ADMIN_PRIMARY_NAV_ITEMS: AdminNavItem[] = [
  { href: '/admin/analytics', key: 'analytics', icon: LineChart },
  { href: '/admin/companies', key: 'companies', icon: Building2 },
  { href: '/admin/users', key: 'users', icon: Users },
  {
    href: PROJECTS_HREF,
    key: 'projects',
    icon: FolderKanban,
    children: ADMIN_PROJECT_CHILD_NAV_ITEMS,
  },
  { href: '/admin/partners', key: 'partners', icon: Handshake },
  { href: '/admin/bank-offers', key: 'bankOffers', icon: Landmark },
  {
    href: READINESS_HREF,
    key: 'readiness',
    icon: ClipboardCheck,
    children: ADMIN_READINESS_CHILD_NAV_ITEMS,
  },
  { href: '/admin/events', key: 'events', icon: CalendarDays },
];

export const ADMIN_SETTINGS_NAV_ITEM: AdminNavItem = {
  href: '/admin/settings',
  key: 'settings',
  icon: Settings,
  children: ADMIN_SETTINGS_CHILD_NAV_ITEMS,
};

export const ADMIN_SECTION_NAV_ITEMS: AdminNavItem[] = [
  ...ADMIN_PRIMARY_NAV_ITEMS,
  ADMIN_SETTINGS_NAV_ITEM,
];

export const ADMIN_ALL_NAV_ITEMS: AdminNavItem[] = ADMIN_SECTION_NAV_ITEMS.flatMap((item) => [
  item,
  ...(item.children ?? []),
]);

/** Top-level destinations for the mobile profile hub (no nested children). */
export const ADMIN_MOBILE_HUB_NAV_ITEMS: AdminNavItem[] = [
  ...ADMIN_PRIMARY_NAV_ITEMS,
  ADMIN_SETTINGS_NAV_ITEM,
];
