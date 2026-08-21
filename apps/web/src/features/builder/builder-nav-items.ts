import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Briefcase,
  Building,
  Building2,
  ClipboardCheck,
  FolderKanban,
  Home,
  Layers,
  LayoutDashboard,
  Map,
  QrCode,
  Settings,
  Users,
} from 'lucide-react';

export type BuilderNavItemKey =
  | 'dashboard'
  | 'projects'
  | 'buildings'
  | 'floors'
  | 'apartments'
  | 'team'
  | 'company'
  | 'interactiveMapping'
  | 'crm'
  | 'scanner'
  | 'readiness'
  | 'analytics'
  | 'settings';

export type BuilderNavItem = {
  href:
    | '/builder'
    | '/builder/projects'
    | '/builder/projects/buildings'
    | '/builder/projects/floors'
    | '/builder/projects/apartments'
    | '/builder/team'
    | '/builder/company'
    | '/builder/interactive-mapping'
    | '/builder/crm'
    | '/builder/scanner'
    | '/builder/readiness'
    | '/builder/analytics'
    | '/builder/settings';
  key: BuilderNavItemKey;
  icon: LucideIcon;
  children?: BuilderNavItem[];
};

export const BUILDER_PROJECT_CHILD_NAV_ITEMS: BuilderNavItem[] = [
  { href: '/builder/projects/buildings', key: 'buildings', icon: Building },
  { href: '/builder/projects/floors', key: 'floors', icon: Layers },
  { href: '/builder/projects/apartments', key: 'apartments', icon: Home },
];

export const BUILDER_PRIMARY_NAV_ITEMS: BuilderNavItem[] = [
  { href: '/builder', key: 'dashboard', icon: LayoutDashboard },
  {
    href: '/builder/projects',
    key: 'projects',
    icon: FolderKanban,
    children: BUILDER_PROJECT_CHILD_NAV_ITEMS,
  },
  { href: '/builder/interactive-mapping', key: 'interactiveMapping', icon: Map },
  { href: '/builder/team', key: 'team', icon: Users },
  { href: '/builder/company', key: 'company', icon: Building2 },
  { href: '/builder/crm', key: 'crm', icon: Briefcase },
  { href: '/builder/scanner', key: 'scanner', icon: QrCode },
  { href: '/builder/readiness', key: 'readiness', icon: ClipboardCheck },
  { href: '/builder/analytics', key: 'analytics', icon: BarChart3 },
];

export const BUILDER_SETTINGS_NAV_ITEM: BuilderNavItem = {
  href: '/builder/settings',
  key: 'settings',
  icon: Settings,
};

export const BUILDER_SECTION_NAV_ITEMS: BuilderNavItem[] = [
  ...BUILDER_PRIMARY_NAV_ITEMS,
  BUILDER_SETTINGS_NAV_ITEM,
];

export const BUILDER_ALL_NAV_ITEMS: BuilderNavItem[] = BUILDER_SECTION_NAV_ITEMS.flatMap((item) => [
  item,
  ...(item.children ?? []),
]);
