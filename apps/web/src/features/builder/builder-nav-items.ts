import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Briefcase,
  Building2,
  ClipboardCheck,
  FolderKanban,
  LayoutDashboard,
  QrCode,
  Settings,
  Users,
} from 'lucide-react';

export type BuilderNavItem = {
  href:
    | '/builder'
    | '/builder/projects'
    | '/builder/team'
    | '/builder/company'
    | '/builder/crm'
    | '/builder/scanner'
    | '/builder/readiness'
    | '/builder/analytics'
    | '/builder/settings';
  key:
    | 'dashboard'
    | 'projects'
    | 'team'
    | 'company'
    | 'crm'
    | 'scanner'
    | 'readiness'
    | 'analytics'
    | 'settings';
  icon: LucideIcon;
};

export const BUILDER_PRIMARY_NAV_ITEMS: BuilderNavItem[] = [
  { href: '/builder', key: 'dashboard', icon: LayoutDashboard },
  { href: '/builder/projects', key: 'projects', icon: FolderKanban },
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
