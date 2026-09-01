'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';
import { LocaleSegmentSwitcher } from '@/shared/ui/locale-segment-switcher';
import type { SiteHeaderNavHref, SiteHeaderNavKey } from '@/shared/ui/site-header.constants';

type SiteHeaderMobileNavProps = {
  navItems: ReadonlyArray<{
    href: SiteHeaderNavHref;
    key: SiteHeaderNavKey;
  }>;
  pathname: string;
  onClose: () => void;
  isNavActive: (pathname: string, href: SiteHeaderNavHref) => boolean;
  /** Enter/exit motion — driven by parent `useDrawerTransition`. */
  visible: boolean;
  /** Open/close duration in ms (same curve both ways). */
  durationMs: number;
  className?: string | undefined;
};

/**
 * Collapsible public header drawer for viewports below `lg`.
 * Panel-only motion (no row stagger) so open and close stay smooth.
 */
export const SiteHeaderMobileNav = ({
  navItems,
  pathname,
  onClose,
  isNavActive,
  visible,
  durationMs,
  className,
}: SiteHeaderMobileNavProps) => {
  const t = useTranslations('Nav');
  const tHome = useTranslations('HomePage');

  return (
    <div
      id="mobile-nav"
      className={cn(
        'origin-top rounded-[1.25rem] border border-header-border',
        'bg-surface-elevated px-1 py-3 text-ink shadow-[0_12px_40px_rgb(25_38_67/0.14)]',
        'will-change-transform motion-reduce:will-change-auto',
        !visible && 'pointer-events-none',
        className,
      )}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'translate3d(0, 0, 0) scale(1)'
          : 'translate3d(0, -12px, 0) scale(0.98)',
        transitionProperty: 'opacity, transform',
        transitionDuration: `${durationMs}ms`,
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }}
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
