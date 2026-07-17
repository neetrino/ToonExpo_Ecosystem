'use client';

import type { FavoriteTargetType } from '@toonexpo/domain';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import { useSession } from '@/components/auth/session-provider';
import { Link } from '@/i18n/navigation';
import { loginHrefWithCallback } from '@/lib/auth/callback-url';
import { toggleFavoriteAction } from '@/lib/favorites/actions';
import { isFavorited } from '@/lib/favorites/queries';

type FavoriteToggleProps = {
  locale: string;
  targetType: FavoriteTargetType;
  targetId: string;
  /** Current page path including locale prefix, used as login return URL. */
  returnPath: string;
  /** @deprecated Ignored — session is restored client-side from Nest. */
  initialFavorited?: boolean;
  /** @deprecated Ignored — derived from useSession. */
  isBuyer?: boolean;
  /** @deprecated Ignored — derived from useSession. */
  isAuthenticated?: boolean;
};

export function FavoriteToggle({
  locale,
  targetType,
  targetId,
  returnPath,
}: FavoriteToggleProps) {
  const t = useTranslations('catalog.favorite');
  const router = useRouter();
  const { status, user } = useSession();
  const [favorited, setFavorited] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isAuthenticated = status === 'authenticated' && Boolean(user);
  const isBuyer = user?.role === 'BUYER';

  useEffect(() => {
    if (!isBuyer) {
      return;
    }
    let cancelled = false;
    void (async () => {
      const next = await isFavorited({ targetType, targetId });
      if (!cancelled) {
        setFavorited(next);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isBuyer, targetId, targetType]);

  if (status === 'loading') {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Link
        href={loginHrefWithCallback(locale, returnPath)}
        className="catalog-favorite-btn catalog-favorite-btn--login"
      >
        {t('save')}
      </Link>
    );
  }

  if (!isBuyer) {
    return null;
  }

  function onToggle(): void {
    setErrorKey(null);
    startTransition(async () => {
      const previous = favorited;
      setFavorited(!previous);
      const result = await toggleFavoriteAction({ targetType, targetId });
      if (!result.ok) {
        setFavorited(previous);
        setErrorKey(result.errorKey);
        if (result.errorKey === 'unauthorized') {
          router.push(loginHrefWithCallback(locale, returnPath));
        }
      } else {
        setFavorited(result.favorited);
      }
    });
  }

  return (
    <div className="catalog-favorite">
      <button
        type="button"
        className="catalog-favorite-btn"
        disabled={pending}
        aria-pressed={favorited}
        onClick={onToggle}
      >
        {favorited ? t('saved') : t('save')}
      </button>
      {errorKey ? (
        <p role="alert" className="catalog-favorite__error">
          {t(`errors.${errorKey}`)}
        </p>
      ) : null}
    </div>
  );
}
