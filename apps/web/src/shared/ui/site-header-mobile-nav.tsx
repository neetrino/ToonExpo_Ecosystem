'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';
import { LocaleSegmentSwitcher } from '@/shared/ui/locale-segment-switcher';

type NavHref =
  '/apartments' | '/projects' | '/developments' | '/builders' | '/partners' | '/mortgage';

type SiteHeaderMobileNavProps = {
  navItems: ReadonlyArray<{
    href: NavHref;
    key: 'buy' | 'projects' | 'newDevelopments' | 'builders' | 'partners' | 'mortgage';
  }>;
  pathname: string;
  onClose: () => void;
  isNavActive: (pathname: string, href: NavHref) => boolean;
};

/**
 * Collapsible public header drawer for viewports below `lg`.
 * Only marketplace nav + language — account/portal links live in ProfileMenu.
 */
export const SiteHeaderMobileNav = ({
  navItems,
  pathname,
  onClose,
  isNavActive,
}: SiteHeaderMobileNavProps) => {
  const t = useTranslations('Nav');
  const tHome = useTranslations('HomePage');

  return (
    <div
      id="mobile-nav"
      className={cn(
        'relative z-10 mt-1 rounded-[1.25rem] border border-header-border',
        'bg-surface-elevated px-1 py-3 text-ink shadow-md lg:hidden',
      )}
    >
      <nav className="flex flex-col gap-1 text-sm" aria-label={t('main')}>
        {navItems.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-sm px-3 py-3 transition-colors',
                active
                  ? 'bg-brand-soft font-bold text-brand'
                  : 'font-medium text-ink hover:bg-surface hover:text-brand',
              )}
              onClick={onClose}
            >
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      <div className="mt-3 border-t border-header-border px-2 pt-3 pb-1">
        <p className="mb-2 px-1 text-[10px] font-bold tracking-[0.1em] text-header-muted uppercase">
          {tHome('languageLabel')}
        </p>
        <LocaleSegmentSwitcher onLocaleChange={onClose} />
      </div>
    </div>
  );
};
