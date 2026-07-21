'use client';

import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { LogoutButton } from '@/features/auth/components/logout-button';
import { useMeQuery } from '@/features/auth/hooks/use-auth';
import { Link, usePathname } from '@/i18n/navigation';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { LocaleSwitcher } from '@/shared/ui/locale-switcher';
import { cn } from '@/shared/ui/cn';

type SiteHeaderProps = {
  className?: string | undefined;
  /** Transparent over hero imagery. */
  variant?: 'solid' | 'transparent' | undefined;
};

const NAV_HREFS = [
  { href: '/projects' as const, key: 'projects' as const },
  { href: '/builders' as const, key: 'builders' as const },
  { href: '/partners' as const, key: 'partners' as const },
  { href: '/mortgage' as const, key: 'mortgage' as const },
  { href: '/expo' as const, key: 'expoMap' as const },
];

/**
 * Shared top nav: logo, catalog links, locale switcher, auth actions.
 */
export const SiteHeader = ({ className, variant = 'solid' }: SiteHeaderProps) => {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const { data: user, isLoading } = useMeQuery();
  const [menuOpen, setMenuOpen] = useState(false);
  const isTransparent = variant === 'transparent';

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        'relative z-[var(--z-header)] w-full',
        isTransparent
          ? 'bg-transparent text-on-dark'
          : 'border-b border-border bg-surface-elevated/95 text-ink backdrop-blur-md',
        className,
      )}
    >
      <div className="page-container flex items-center justify-between gap-4 py-3.5 sm:py-4">
        <BrandLogo inverted={isTransparent} />

        <nav
          className={cn(
            'hidden items-center gap-7 text-[13px] font-medium md:flex',
            isTransparent ? 'text-on-dark/90' : 'text-ink-secondary',
          )}
          aria-label={t('main')}
        >
          {NAV_HREFS.map((item) => {
            const active =
              item.href === '/projects'
                ? pathname.startsWith('/projects')
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-opacity hover:opacity-100',
                  active ? (isTransparent ? 'text-on-dark' : 'text-ink') : 'opacity-80',
                )}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className={cn(isTransparent && '[&_button]:text-on-dark')}>
            <LocaleSwitcher />
          </div>
          {isLoading ? (
            <span className="text-sm opacity-70">{t('loading')}</span>
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className={cn(
                  'hidden max-w-32 truncate text-sm font-medium sm:inline',
                  isTransparent ? 'text-on-dark hover:opacity-80' : 'text-ink hover:text-brand',
                )}
              >
                {user.name}
              </Link>
              <LogoutButton />
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    isTransparent && 'border-transparent text-on-dark hover:bg-white/10',
                  )}
                >
                  {t('login')}
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button
                  size="sm"
                  variant={isTransparent ? 'outline' : 'secondary'}
                  className={cn(
                    isTransparent && 'border-transparent bg-on-dark text-ink hover:bg-on-dark/90',
                  )}
                >
                  {t('register')}
                </Button>
              </Link>
            </div>
          )}

          <IconButton
            label={t('menu')}
            className={cn(
              'md:hidden',
              isTransparent && 'border-white/35 text-on-dark hover:bg-white/10',
            )}
            variant="outline"
            size="sm"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <X className="size-4" aria-hidden />
            ) : (
              <Menu className="size-4" aria-hidden />
            )}
          </IconButton>
        </div>
      </div>

      {menuOpen ? (
        <div
          id="mobile-nav"
          className="border-t border-border/40 bg-surface-elevated px-6 py-5 text-ink shadow-md md:hidden"
        >
          <nav className="flex flex-col gap-1 text-sm" aria-label={t('main')}>
            {NAV_HREFS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-sm px-3 py-3 font-medium text-ink hover:bg-surface"
                onClick={() => setMenuOpen(false)}
              >
                {t(item.key)}
              </Link>
            ))}
            {!user ? (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-sm px-3 py-3 font-medium text-ink hover:bg-surface"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('login')}
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-sm px-3 py-3 font-medium text-brand hover:bg-brand-soft"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('register')}
                </Link>
              </>
            ) : (
              <Link
                href="/profile"
                className="rounded-sm px-3 py-3 font-medium text-ink hover:bg-surface"
                onClick={() => setMenuOpen(false)}
              >
                {user.name}
              </Link>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
};
