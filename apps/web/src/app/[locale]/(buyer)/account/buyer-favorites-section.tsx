'use client';

import type { FavoriteListItem } from '@toonexpo/contracts';
import type { ApartmentStatus } from '@toonexpo/domain';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { Link } from '@/i18n/navigation';
import { formatPriceAmd } from '@/lib/catalog/format-price';
import { removeFavoriteAction } from '@/lib/favorites/actions';

type BuyerFavoritesSectionProps = {
  locale: string;
  favorites: FavoriteListItem[];
  statusLabels: Record<ApartmentStatus, string>;
};

function favoriteHref(item: FavoriteListItem): string {
  const projectPath = `/projects/${item.companySlug}/${item.projectSlug}`;
  if (item.targetType === 'APARTMENT') {
    return `${projectPath}/apartments/${item.targetId}`;
  }
  return projectPath;
}

function FavoritePrice({
  item,
  locale,
  noValue,
}: {
  item: FavoriteListItem;
  locale: string;
  noValue: string;
}) {
  const t = useTranslations('catalog');
  if (item.targetType !== 'APARTMENT' || item.priceDisplay === null) {
    return <span>{noValue}</span>;
  }
  if (item.priceDisplay === 'AMOUNT') {
    return <span>{item.priceAmd !== null ? formatPriceAmd(item.priceAmd, locale) : noValue}</span>;
  }
  if (item.priceDisplay === 'BY_REQUEST') {
    return <span>{t('apartment.priceByRequest')}</span>;
  }
  if (item.priceDisplay === 'LOGIN_REQUIRED') {
    return <span>{t('apartment.priceLoginRequired')}</span>;
  }
  return <span>{t('apartment.priceHidden')}</span>;
}

function FavoriteRow({
  item,
  locale,
  statusLabels,
  dateFormatter,
}: {
  item: FavoriteListItem;
  locale: string;
  statusLabels: Record<ApartmentStatus, string>;
  dateFormatter: Intl.DateTimeFormat;
}) {
  const t = useTranslations('buyer.account.favorites');
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onRemove(): void {
    startTransition(async () => {
      await removeFavoriteAction({
        targetType: item.targetType,
        targetId: item.targetId,
      });
      router.refresh();
    });
  }

  return (
    <li className="buyer-favorites__item">
      <div className="buyer-favorites__main">
        <Link href={favoriteHref(item)} className="buyer-favorites__title">
          {item.title}
        </Link>
        <p className="buyer-favorites__meta">
          {item.companyName}
          {item.targetType === 'APARTMENT' ? ` · ${item.projectName}` : null}
        </p>
        <p className="buyer-favorites__meta">
          {item.targetType === 'APARTMENT' && item.apartmentStatus
            ? statusLabels[item.apartmentStatus]
            : t('typeProject')}
          {' · '}
          <FavoritePrice item={item} locale={locale} noValue={t('noValue')} />
          {' · '}
          {dateFormatter.format(item.createdAt)}
        </p>
      </div>
      <button
        type="button"
        className="buyer-favorites__remove"
        disabled={pending}
        onClick={onRemove}
      >
        {t('remove')}
      </button>
    </li>
  );
}

export function BuyerFavoritesSection({
  locale,
  favorites,
  statusLabels,
}: BuyerFavoritesSectionProps) {
  const t = useTranslations('buyer.account.favorites');
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <section className="buyer-account__favorites" aria-labelledby="buyer-favorites-heading">
      <h2 id="buyer-favorites-heading" className="buyer-account__section-title">
        {t('heading')}
      </h2>
      {favorites.length === 0 ? (
        <p className="buyer-account__empty">{t('empty')}</p>
      ) : (
        <ul className="buyer-favorites__list">
          {favorites.map((item) => (
            <FavoriteRow
              key={item.id}
              item={item}
              locale={locale}
              statusLabels={statusLabels}
              dateFormatter={dateFormatter}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
