'use client';

import {
  BarChart3,
  Briefcase,
  Building2,
  ClipboardCheck,
  FolderKanban,
  LayoutDashboard,
  QrCode,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/shared/ui/cn';

/** Matches admin Analytics page title icon chrome. */
const PAGE_TITLE_ICON_BOX_CLASS =
  'mt-0.5 inline-flex size-14 shrink-0 items-center justify-center rounded-md bg-[#d3f6f6] text-[#2bb5ad]';

/** Serializable keys for RSC → client title icons (cannot pass Lucide components). */
export type PageTitleIconName =
  | 'dashboard'
  | 'projects'
  | 'company'
  | 'team'
  | 'crm'
  | 'scanner'
  | 'readiness'
  | 'analytics';

const PAGE_TITLE_ICONS: Record<PageTitleIconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  projects: FolderKanban,
  company: Building2,
  team: Users,
  crm: Briefcase,
  scanner: QrCode,
  readiness: ClipboardCheck,
  analytics: BarChart3,
};

type PageTitleIconProps = {
  icon: LucideIcon;
  className?: string | undefined;
};

/**
 * Soft teal icon tile used beside portal page titles (Analytics pattern).
 */
export const PageTitleIcon = ({ icon: Icon, className }: PageTitleIconProps) => {
  return (
    <span className={cn(PAGE_TITLE_ICON_BOX_CLASS, className)}>
      <Icon className="size-7" strokeWidth={2} aria-hidden />
    </span>
  );
};

type PageTitleBlockProps = {
  title: string;
  subtitle?: string | undefined;
  /** Prefer for client-only parents. */
  icon?: LucideIcon | undefined;
  /** Prefer from Server Components — resolved on the client. */
  iconName?: PageTitleIconName | undefined;
  className?: string | undefined;
  children?: ReactNode | undefined;
};

/**
 * Page title row with optional Analytics-style leading icon.
 */
export const PageTitleBlock = ({
  title,
  subtitle,
  icon,
  iconName,
  className,
  children,
}: PageTitleBlockProps) => {
  const resolvedIcon = icon ?? (iconName ? PAGE_TITLE_ICONS[iconName] : undefined);

  return (
    <div className={cn('flex min-w-0 items-start gap-3', className)}>
      {resolvedIcon ? <PageTitleIcon icon={resolvedIcon} /> : null}
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-page-title text-ink">{title}</h1>
        {subtitle ? <p className="text-sm text-ink-secondary">{subtitle}</p> : null}
        {children}
      </div>
    </div>
  );
};
