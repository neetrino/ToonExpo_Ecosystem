'use client';

import { Building2, LogIn, LogOut, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';

import { useLogoutMutation } from '@/features/auth/hooks/use-auth';
import { Link, usePathname } from '@/i18n/navigation';
import { blurActiveElementAfterEscClose } from '@/shared/ui/blur-active-element';
import { cn } from '@/shared/ui/cn';

/** Keeps the menu open while the pointer moves from trigger to panel. */
const HOVER_CLOSE_DELAY_MS = 120;

type ProfileMenuProps = {
  userName?: string | undefined;
  userEmail?: string | undefined;
  accountType?: string | undefined;
  companyType?: string | null | undefined;
  /** When true, show Builder portal link above Log out. */
  showBuilder?: boolean | undefined;
  /** Visual tone for light surfaces vs dark hero chrome. */
  tone?: 'light' | 'dark' | undefined;
};

/**
 * Header account control — Figma circular trigger.
 * Guests go to login; signed-in opens role links / Log out on hover (click on touch).
 * Menu is `absolute` under the trigger so it inherits desktop `zoom` (Safari-safe).
 */
export const ProfileMenu = ({
  userName,
  userEmail,
  accountType,
  companyType,
  showBuilder: showBuilderProp,
  tone = 'light',
}: ProfileMenuProps) => {
  const t = useTranslations('Nav');
  const tAuth = useTranslations('Auth');
  const pathname = usePathname();
  const logoutMutation = useLogoutMutation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = useId();
  const isDark = tone === 'dark';
  const isSignedIn = Boolean(userName || userEmail);
  const showAdmin = accountType === 'platform_admin';
  const showBuilder =
    showBuilderProp ??
    (accountType === 'company_member' && (companyType == null || companyType === 'builder'));

  const clearCloseTimer = (): void => {
    if (closeTimerRef.current == null) {
      return;
    }
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  const openMenu = (): void => {
    clearCloseTimer();
    setOpen(true);
  };

  const scheduleCloseMenu = (): void => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, HOVER_CLOSE_DELAY_MS);
  };

  useEffect(() => {
    setOpen(false);
    clearCloseTimer();
  }, [pathname]);

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent): void => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setOpen(false);
        blurActiveElementAfterEscClose();
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
    'inline-flex size-10 items-center justify-center rounded-full',
    'transition-colors duration-[var(--duration-fast)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-deep/30',
    isDark ? 'bg-on-dark text-ink' : 'bg-brand-deep text-on-dark',
  );

  const menuItemClassName = cn(
    'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium',
    'transition-colors duration-[var(--duration-fast)]',
    'text-ink hover:bg-surface',
  );

  if (!isSignedIn) {
    return (
      <Link
        href="/auth/login"
        prefetch
        aria-label={t('login')}
        title={t('login')}
        className={triggerClassName}
      >
        <LogIn className="size-5" aria-hidden />
      </Link>
    );
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleCloseMenu}
    >
      <button
        type="button"
        className={triggerClassName}
        aria-label={t('profileMenu')}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          clearCloseTimer();
          setOpen(true);
        }}
        onFocus={openMenu}
      >
        <LogIn className="size-5" aria-hidden />
      </button>

      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={t('profileMenu')}
          className={cn(
            'absolute top-[calc(100%+8px)] right-0 z-[var(--z-dropdown)] w-44 overflow-hidden',
            'rounded-[12px] border border-header-border bg-surface-elevated py-1.5 text-ink shadow-md',
          )}
        >
          {showAdmin ? (
            <Link
              href="/admin"
              role="menuitem"
              className={menuItemClassName}
              onClick={() => setOpen(false)}
            >
              <Shield className="size-4 shrink-0 opacity-80" aria-hidden />
              {t('admin')}
            </Link>
          ) : null}

          {showBuilder ? (
            <Link
              href="/builder"
              role="menuitem"
              className={menuItemClassName}
              onClick={() => setOpen(false)}
            >
              <Building2 className="size-4 shrink-0 opacity-80" aria-hidden />
              {t('builder')}
            </Link>
          ) : null}

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
