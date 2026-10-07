'use client';

import type { FavoriteTargetType } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { useMeQuery } from '@/features/auth/hooks/use-auth';
import { FavoriteHeartIcon } from '@/features/buyer/components/favorite-heart-icon';
import { useFavoritesStatusContext } from '@/features/buyer/components/favorites-status-provider';
import {
  useFavoritesStatusQuery,
  useToggleFavoriteMutation,
} from '@/features/buyer/hooks/use-favorites';
import { isBuyerAccount, isNonBuyerStaff } from '@/features/buyer/utils/is-buyer-account';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type FavoriteToggleButtonProps = {
  targetType: FavoriteTargetType;
  targetId: string;
  className?: string | undefined;
  variant?: 'overlay' | 'surface' | 'prominent' | undefined;
};

const heartClassName = (
  variant: 'overlay' | 'surface' | 'prominent',
  favorited: boolean,
): string | undefined => {
  if (variant !== 'prominent') {
    return undefined;
  }
  return favorited ? 'size-6 fill-brand text-brand' : 'size-6 fill-none text-current';
};

const variantClassNames = {
  overlay: 'border-white/50 bg-white/85 text-ink shadow-sm hover:bg-white',
  surface: 'border-border bg-surface text-ink shadow-none hover:bg-background',
  prominent: '',
} as const;

const prominentClassName = (favorited: boolean): string =>
  favorited
    ? 'size-11 border-2 border-brand bg-white text-brand shadow-none hover:bg-band-mist'
    : 'size-11 border-2 border-header-border bg-white text-header-muted shadow-none hover:border-brand hover:text-brand';

/**
 * Catalog heart toggle — guests link to login; buyers toggle optimistically.
 */
export const FavoriteToggleButton = ({
  targetType,
  targetId,
  className,
  variant = 'overlay',
}: FavoriteToggleButtonProps) => {
  const t = useTranslations('Favorites');
  const pathname = usePathname();
  const { data: user, isLoading: authLoading } = useMeQuery();
  const batchContext = useFavoritesStatusContext();
  const fallbackQuery = useFavoritesStatusQuery(
    [{ targetType, targetId }],
    isBuyerAccount(user) && batchContext == null,
  );
  const mutation = useToggleFavoriteMutation();
  const [pending, setPending] = useState<boolean | null>(null);

  const serverFavorited = useMemo(() => {
    if (batchContext) {
      return batchContext.isFavorited(targetType, targetId);
    }
    const key = `${targetType}:${targetId}`;
    return fallbackQuery.data?.favorited.includes(key) ?? false;
  }, [batchContext, fallbackQuery.data?.favorited, targetId, targetType]);

  if (authLoading) {
    return null;
  }

  if (isNonBuyerStaff(user?.accountType)) {
    return null;
  }

  const favorited = pending ?? serverFavorited;
  const label = favorited ? t('removeLabel') : t('addLabel');
  const buttonClassName = cn(
    'inline-flex size-9 items-center justify-center rounded-pill border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
    variant === 'prominent' ? prominentClassName(favorited) : variantClassNames[variant],
    className,
  );

  if (!user) {
    const returnUrl = encodeURIComponent(pathname);
    return (
      <Link
        href={`/auth/login?returnUrl=${returnUrl}`}
        className={buttonClassName}
        aria-label={t('loginToSave')}
      >
        <FavoriteHeartIcon filled={false} className={heartClassName(variant, false)} />
      </Link>
    );
  }

  if (!isBuyerAccount(user)) {
    return null;
  }

  const handleToggle = () => {
    const next = !favorited;
    setPending(next);
    mutation.mutate(
      { targetType, targetId, favorited },
      {
        onError: () => setPending(null),
        onSettled: () => setPending(null),
      },
    );
  };

  return (
    <button
      type="button"
      className={buttonClassName}
      aria-pressed={favorited}
      aria-label={label}
      disabled={mutation.isPending}
      onClick={handleToggle}
    >
      <FavoriteHeartIcon filled={favorited} className={heartClassName(variant, favorited)} />
    </button>
  );
};
