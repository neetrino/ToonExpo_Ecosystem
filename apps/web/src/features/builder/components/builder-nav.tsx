'use client';

import {
  BarChart3,
  Building2,
  ClipboardCheck,
  FolderKanban,
  LayoutDashboard,
  QrCode,
  Users,
  Briefcase,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { LucideIcon } from 'lucide-react';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type NavItem = {
  href:
    | '/builder'
    | '/builder/projects'
    | '/builder/team'
    | '/builder/company'
    | '/builder/crm'
    | '/builder/scanner'
    | '/builder/readiness'
    | '/builder/analytics';
  key:
    'dashboard' | 'projects' | 'team' | 'company' | 'crm' | 'scanner' | 'readiness' | 'analytics';
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/builder', key: 'dashboard', icon: LayoutDashboard },
  { href: '/builder/projects', key: 'projects', icon: FolderKanban },
  { href: '/builder/team', key: 'team', icon: Users },
  { href: '/builder/company', key: 'company', icon: Building2 },
  { href: '/builder/crm', key: 'crm', icon: Briefcase },
  { href: '/builder/scanner', key: 'scanner', icon: QrCode },
  { href: '/builder/readiness', key: 'readiness', icon: ClipboardCheck },
  { href: '/builder/analytics', key: 'analytics', icon: BarChart3 },
];

type BuilderNavProps = {
  companyName: string | null;
};

/**
 * Sidebar navigation for the builder portal shell.
 */
export const BuilderNav = ({ companyName }: BuilderNavProps) => {
  const t = useTranslations('Builder.nav');
  const pathname = usePathname();

  return (
    <nav aria-label={t('label')} className="flex flex-col gap-1">
      {companyName ? (
        <p className="mb-3 truncate px-3 text-sm font-semibold text-ink">{companyName}</p>
      ) : null}
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-ink-muted">
        {t('section')}
      </p>
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === '/builder' ? pathname === '/builder' : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-brand-soft text-brand'
                : 'text-ink-secondary hover:bg-surface hover:text-ink',
            )}
          >
            <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
};
