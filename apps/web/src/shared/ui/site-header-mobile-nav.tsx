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
  visible?: boolean | undefined;
  className?: string | undefined;
};

/** Stagger between nav rows on open (ms). */
const ITEM_STAGGER_MS = 38;
/** Base delay before first row (ms). */
const ITEM_STAGGER_BASE_MS = 55;
/** Row travel / fade on open (ms). */
const ITEM_ENTER_MS = 340;
/** Row fade on close — must finish before panel unmount (~260ms). */
const ITEM_EXIT_MS = 200;

/**
 * Collapsible public header drawer for viewports below `lg`.
 * Only marketplace nav + language — account/portal links live in ProfileMenu.
 */
export const SiteHeaderMobileNav = ({
  navItems,
  pathname,
  onClose,
  isNavActive,
  visible = true,
  className,
}: SiteHeaderMobileNavProps) => {
  const t = useTranslations('Nav');
  const tHome = useTranslations('HomePage');

  return (
    <div
      id="mobile-nav"
      className={cn(
        'origin-top rounded-[1.25rem] border border-header-border',
        'bg-surface-elevated px-1 py-3 text-ink shadow-[0_12px_40px_rgb(9_43_68/0.14)]',
        'transition-[opacity,transform] duration-[var(--burger-menu-ms,420ms)]',
        'ease-[var(--ease-out-premium)] will-change-transform',
        'motion-reduce:transition-none motion-reduce:duration-0 motion-reduce:will-change-auto',
        visible
          ? 'translate-y-0 scale-100 opacity-100'
          : 'pointer-events-none -translate-y-2 scale-[0.98] opacity-0',
        className,
      )}
    >
      <nav className="flex flex-col gap-1 text-sm" aria-label={t('main')}>
        {navItems.map((item, index) => {
          const active = isNavActive(pathname, item.href);
          const delayMs = visible ? ITEM_STAGGER_BASE_MS + index * ITEM_STAGGER_MS : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-sm px-3 py-3 transition-[color,background-color,opacity,transform]',
                'ease-[var(--ease-out-premium)] motion-reduce:transition-colors motion-reduce:delay-0',
                active
                  ? 'bg-brand-soft font-bold text-brand'
                  : 'font-medium text-ink hover:bg-surface hover:text-brand',
                visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
              )}
              style={{
                transitionDuration: `${visible ? ITEM_ENTER_MS : ITEM_EXIT_MS}ms`,
                transitionDelay: `${delayMs}ms`,
              }}
              onClick={onClose}
            >
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          'mt-3 border-t border-header-border px-2 pt-3 pb-1',
          'transition-[opacity,transform] ease-[var(--ease-out-premium)]',
          'motion-reduce:transition-none motion-reduce:delay-0',
          visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        )}
        style={{
          transitionDuration: `${visible ? ITEM_ENTER_MS : ITEM_EXIT_MS}ms`,
          transitionDelay: visible
            ? `${ITEM_STAGGER_BASE_MS + navItems.length * ITEM_STAGGER_MS}ms`
            : '0ms',
        }}
      >
        <p className="mb-2 px-1 text-[10px] font-bold tracking-[0.1em] text-header-muted uppercase">
          {tHome('languageLabel')}
        </p>
        <LocaleSegmentSwitcher onLocaleChange={onClose} />
      </div>
    </div>
  );
};
