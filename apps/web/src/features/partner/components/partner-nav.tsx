'use client';

import { Building2, Landmark, LayoutDashboard, Tag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { PartnerCompanyType } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type PartnerNavProps = {
  companyName: string | null;
  partnerName: string | null;
  partnerType: PartnerCompanyType;
};

type NavItem = {
  href: '/partner' | '/partner/offers' | '/partner/bank-offers';
  key: 'profile' | 'offers' | 'bankOffers';
  icon: LucideIcon;
};

const BASE_NAV_ITEMS: NavItem[] = [
  { href: '/partner', key: 'profile', icon: LayoutDashboard },
  { href: '/partner/offers', key: 'offers', icon: Tag },
];

const BANK_NAV_ITEM: NavItem = {
  href: '/partner/bank-offers',
  key: 'bankOffers',
  icon: Landmark,
};

/**
 * Sidebar navigation for the partner portal shell.
 */
export const PartnerNav = ({ companyName, partnerName, partnerType }: PartnerNavProps) => {
  const t = useTranslations('Partner.nav');
  const pathname = usePathname();

  const navItems = partnerType === 'bank' ? [...BASE_NAV_ITEMS, BANK_NAV_ITEM] : BASE_NAV_ITEMS;

  return (
    <nav aria-label={t('label')} className="flex flex-col gap-1">
      {companyName ? (
        <p className="mb-1 flex items-center gap-2 truncate px-3 text-sm font-semibold text-ink">
          <Building2 className="size-3.5 shrink-0 text-ink-muted" aria-hidden />
          {companyName}
        </p>
      ) : null}
      {partnerName ? (
        <p className="mb-3 truncate px-3 text-xs text-ink-secondary">{partnerName}</p>
      ) : null}
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-ink-muted">
        {t('section')}
      </p>
      {navItems.map((item) => {
        const active =
          item.href === '/partner' ? pathname === '/partner' : pathname.startsWith(item.href);
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
