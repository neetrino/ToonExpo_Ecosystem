'use client';

import type { FavoriteTargetType } from '@toonexpo/domain';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Link } from '@/i18n/navigation';
import { loginHrefWithCallback } from '@/lib/auth/callback-url';
import { toggleFavoriteAction } from '@/lib/favorites/actions';

type FavoriteToggleProps = {
  locale: string;
  targetType: FavoriteTargetType;
  targetId: string;
  /** Current page path including locale prefix, used as login return URL. */
  returnPath: string;
  initialFavorited: boolean;
  isBuyer: boolean;
  isAuthenticated: boolean;
};

export function FavoriteToggle({
  locale,
  targetType,
  targetId,
  returnPath,
  initialFavorited,
  isBuyer,
  isAuthenticated,
}: FavoriteToggleProps) {
  const t = useTranslations('catalog.favorite');
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
        return;
      }
      setFavorited(result.favorited);
      router.refresh();
    });
  }

  return (
    <div className="catalog-favorite">
      <button
        type="button"
        className={
          favorited ? 'catalog-favorite-btn catalog-favorite-btn--active' : 'catalog-favorite-btn'
        }
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
