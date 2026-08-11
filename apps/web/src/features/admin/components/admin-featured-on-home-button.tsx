'use client';

import type { FeaturedOnHomeResponse } from '@toonexpo/contracts';
import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import { ApiError, isApiErrorStatus } from '@/shared/api/errors';
import { cn } from '@/shared/ui/cn';
import { EphemeralToast } from '@/shared/ui/ephemeral-toast';

type AdminFeaturedOnHomeButtonProps = {
  featuredOnHome: boolean;
  disabled?: boolean | undefined;
  onToggle: (next: boolean) => Promise<FeaturedOnHomeResponse>;
  limitLabel: string;
};

type ToastState = {
  id: number;
  message: string;
};

/**
 * Bare heart toggle to pin/unpin an entity on the public homepage.
 */
export const AdminFeaturedOnHomeButton = ({
  featuredOnHome,
  disabled = false,
  onToggle,
  limitLabel,
}: AdminFeaturedOnHomeButtonProps) => {
  const t = useTranslations('Admin.featuredOnHome');
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const label = featuredOnHome ? t('unpin') : t('pin');

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = (message: string) => {
    setToast({ id: Date.now(), message });
  };

  const handleClick = async () => {
    if (pending || disabled) {
      return;
    }
    setPending(true);
    try {
      await onToggle(!featuredOnHome);
    } catch (caught) {
      if (isApiErrorStatus(caught, 409)) {
        showToast(limitLabel);
      } else if (caught instanceof ApiError) {
        showToast(t('error'));
      } else {
        showToast(t('error'));
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label={label}
        title={label}
        aria-pressed={featuredOnHome}
        disabled={pending || disabled}
        className={cn(
          'inline-flex size-8 shrink-0 items-center justify-center rounded-sm',
          'transition-colors duration-[var(--duration-fast)]',
          'hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
          'disabled:pointer-events-none disabled:opacity-50',
          featuredOnHome ? 'text-brand' : 'text-ink-muted',
        )}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void handleClick();
        }}
      >
        <Heart
          className={cn('size-4', featuredOnHome ? 'fill-brand' : undefined)}
          aria-hidden
        />
      </button>
      <EphemeralToast
        key={toast?.id ?? 'empty'}
        message={toast?.message ?? null}
        onDismiss={dismissToast}
      />
    </>
  );
};
