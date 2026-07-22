'use client';

import { LogOut, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';

import { useLogoutMutation } from '@/features/auth/hooks/use-auth';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type ProfileMenuProps = {
  /** Dashboard / account destination when signed in. */
  accountHref: '/dashboard' | '/admin/settings';
  userName?: string | undefined;
  userEmail?: string | undefined;
  /** Visual tone for light surfaces vs dark hero chrome. */
  tone?: 'light' | 'dark' | undefined;
};

/**
 * Header profile control — guest links to login; signed-in opens account dropdown + logout.
 */
export const ProfileMenu = ({
  accountHref,
  userName,
  userEmail,
  tone = 'light',
}: ProfileMenuProps) => {
  const t = useTranslations('Nav');
  const tAuth = useTranslations('Auth');
  const pathname = usePathname();
  const router = useRouter();
  const logoutMutation = useLogoutMutation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const isDark = tone === 'dark';
  const isSignedIn = Boolean(userName || userEmail);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const triggerClassName = cn(
    'inline-flex size-9 items-center justify-center rounded-sm border',
    'transition-colors duration-[var(--duration-fast)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
    isDark
      ? cn(
          'border-white/30 bg-white/10 text-on-dark hover:bg-white/15',
          open && 'border-white/45 bg-white/15',
        )
      : cn(
          'border-border bg-surface-elevated text-ink hover:border-border-strong hover:bg-surface',
          open && 'border-brand/40 shadow-xs',
        ),
  );

  if (!isSignedIn) {
    return (
      <Link
        href="/auth/login"
        aria-label={t('profile')}
        title={t('profile')}
        className={triggerClassName}
      >
        <UserRound className="size-4" aria-hidden />
      </Link>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={triggerClassName}
        aria-label={t('profileMenu')}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <UserRound className="size-4" aria-hidden />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={t('profileMenu')}
          className={cn(
            'absolute top-[calc(100%+0.4rem)] right-0 z-[var(--z-dropdown)] w-[15.5rem] overflow-hidden',
            'rounded-sm border py-1.5 shadow-md',
            'animate-[locale-dropdown-in_var(--duration-base)_var(--ease-out-premium)]',
            isDark
              ? 'border-white/15 bg-surface-inverse text-on-dark'
              : 'border-border/80 bg-surface-elevated text-ink',
          )}
        >
          <div
            className={cn(
              'border-b px-3.5 py-2.5',
              isDark ? 'border-white/10' : 'border-border/60',
            )}
          >
            {userName ? (
              <p
                className={cn(
                  'truncate text-sm font-semibold tracking-tight',
                  isDark ? 'text-on-dark' : 'text-ink',
                )}
              >
                {userName}
              </p>
            ) : null}
            {userEmail ? (
              <p
                className={cn(
                  'mt-0.5 truncate text-xs',
                  isDark ? 'text-on-dark/65' : 'text-ink-secondary',
                )}
              >
                {userEmail}
              </p>
            ) : null}
          </div>

          <Link
            href={accountHref}
            role="menuitem"
            className={cn(
              'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium',
              'transition-colors duration-[var(--duration-fast)]',
              isDark ? 'text-on-dark/90 hover:bg-white/8' : 'text-ink hover:bg-surface',
            )}
            onClick={() => setOpen(false)}
          >
            <UserRound className="size-4 shrink-0 opacity-80" aria-hidden />
            {t('profile')}
          </Link>

          <button
            type="button"
            role="menuitem"
            className={cn(
              'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium',
              'transition-colors duration-[var(--duration-fast)]',
              'text-danger hover:bg-danger-soft',
              'disabled:pointer-events-none disabled:opacity-50',
            )}
            disabled={logoutMutation.isPending}
            onClick={() => {
              void logoutMutation.mutateAsync().then(() => {
                setOpen(false);
                router.push('/auth/login');
              });
            }}
          >
            <LogOut className="size-4 shrink-0 opacity-80" aria-hidden />
            {logoutMutation.isPending ? tAuth('logout.submitting') : tAuth('logout.submit')}
          </button>
        </div>
      ) : null}
    </div>
  );
};
