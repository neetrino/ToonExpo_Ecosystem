'use client';

import type { FeaturedOnHomeResponse } from '@toonexpo/contracts';
import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import { ApiError, isApiErrorStatus } from '@/shared/api/errors';
import { cn } from '@/shared/ui/cn';
import { EphemeralToast } from '@/shared/ui/ephemeral-toast';
import { IconButton } from '@/shared/ui/icon-button';

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
 * Heart toggle to pin/unpin an entity on the public homepage.
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
      <IconButton
        label={label}
        variant={featuredOnHome ? 'soft' : 'ghost'}
        size="md"
        disabled={pending || disabled}
        aria-pressed={featuredOnHome}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void handleClick();
        }}
      >
        <Heart
          className={cn(
            'size-4',
            featuredOnHome ? 'fill-brand text-brand' : 'text-ink-muted',
          )}
          aria-hidden
        />
      </IconButton>
      <EphemeralToast
        key={toast?.id ?? 'empty'}
        message={toast?.message ?? null}
        onDismiss={dismissToast}
      />
    </>
  );
};
