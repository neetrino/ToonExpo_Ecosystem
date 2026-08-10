'use client';

import type {
  BuyerQrScanHistoryItem,
  BuyerRequestListItem,
  FavoriteListItem,
} from '@toonexpo/contracts';
import { Building2 } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import {
  AccountStatusBadge,
  getRequestStatusTone,
} from '@/features/buyer/components/account/account-status-badge';
import { formatBuyerDateTime } from '@/features/buyer/utils/format-datetime';
import { AnalyticsSectionCard } from '@/features/analytics/components/analytics-section-card';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

const PREVIEW_ITEM_LIMIT = 5;
const THUMB_PX = 40;

type ListThumbProps = {
  src: string | null;
};

const ListThumb = ({ src }: ListThumbProps) => (
  <span
    className={cn(
      'relative inline-flex size-10 shrink-0 items-center justify-center',
      'overflow-hidden rounded-md bg-surface text-ink-muted',
    )}
  >
    {src ? (
      <Image
        src={src}
        alt=""
        width={THUMB_PX}
        height={THUMB_PX}
        className="size-full object-cover"
      />
    ) : (
      <Building2 className="size-4" aria-hidden />
    )}
  </span>
);

export const favoriteLabel = (item: FavoriteListItem): string => {
  if (item.targetType === 'project') {
    return item.project.name;
  }
  return `${item.apartment.project.name} · #${item.apartment.number}`;
};

const favoriteCoverUrl = (item: FavoriteListItem): string | null => {
  const cover =
    item.targetType === 'project' ? item.project.cover : item.apartment.cover;
  return cover?.thumbnailUrl ?? cover?.fileUrl ?? null;
};

const requestImageUrl = (item: BuyerRequestListItem): string | null =>
  item.projectCoverUrl ?? item.builderLogoUrl;

type DashboardRequestListProps = {
  items: BuyerRequestListItem[];
  locale: string;
};

export const DashboardRequestList = ({ items, locale }: DashboardRequestListProps) => {
  const t = useTranslations('Profile.requests');

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => {
        const title = item.projectName ?? item.builderCompanyName;
        return (
          <li
            key={item.requestId}
            className="flex flex-col gap-1.5 border-b border-border/60 pb-3 last:border-0 last:pb-0"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-start gap-3">
                <ListThumb src={requestImageUrl(item)} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{title}</p>
                  <p className="truncate text-xs text-ink-secondary">{item.builderCompanyName}</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {formatBuyerDateTime(item.updatedAt, locale)}
                  </p>
                </div>
              </div>
              <AccountStatusBadge
                label={t(`status.${item.buyerStatus}`)}
                tone={getRequestStatusTone(item.buyerStatus)}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

type DashboardScanListProps = {
  items: BuyerQrScanHistoryItem[];
  locale: string;
};

export const DashboardScanList = ({ items, locale }: DashboardScanListProps) => {
  const t = useTranslations('Profile.qr');

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-col gap-0.5 border-b border-border/60 pb-3 last:border-0 last:pb-0"
        >
          <p className="truncate text-sm font-semibold text-ink">
            {item.scannerCompanyName ?? t('scans.unknownCompany')}
          </p>
          <p className="text-xs text-ink-muted">{formatBuyerDateTime(item.createdAt, locale)}</p>
          <p className="text-xs font-medium text-ink-secondary">
            {t(`scans.context.${item.scanContext}`)}
          </p>
        </li>
      ))}
    </ul>
  );
};

type FavoritesSectionProps = {
  favorites: FavoriteListItem[];
};

export const FavoritesSection = ({ favorites }: FavoritesSectionProps) => {
  const t = useTranslations('Profile.dashboard');

  return (
    <AnalyticsSectionCard
      title={t('sections.savedFavorites')}
      empty={favorites.length === 0}
      emptyLabel={t('empty.favorites')}
      className="h-full"
      action={
        <Link href="/favorites" className="text-sm font-medium text-brand-secondary hover:underline">
          {t('viewAll')}
        </Link>
      }
    >
      <ul className="flex flex-col gap-2.5">
        {favorites.slice(0, PREVIEW_ITEM_LIMIT).map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 border-b border-border/60 pb-2.5 last:border-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <ListThumb src={favoriteCoverUrl(item)} />
                <span className="min-w-0 truncate text-sm font-medium text-ink">
                  {favoriteLabel(item)}
                </span>
              </div>
              <span className="shrink-0 text-xs text-ink-muted">
                {item.targetType === 'project' ? t('favoriteProject') : t('favoriteApartment')}
              </span>
            </li>
        ))}
      </ul>
    </AnalyticsSectionCard>
  );
};

type CheckInShortcutsSectionProps = {
  eventName: string | undefined;
  checkedIn: boolean;
  hasCurrent: boolean;
};

export const CheckInShortcutsSection = ({
  eventName,
  checkedIn,
  hasCurrent,
}: CheckInShortcutsSectionProps) => {
  const t = useTranslations('Profile.dashboard');

  return (
    <AnalyticsSectionCard
      title={t('sections.checkinStatus')}
      className="h-full"
      action={
        <Link href="/checkin" className="text-sm font-medium text-brand-secondary hover:underline">
          {t('viewAll')}
        </Link>
      }
    >
      <div className="flex flex-col gap-4">
        {hasCurrent && eventName ? (
          <div className="rounded-[12px] border border-border/70 bg-canvas/50 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-ink">{eventName}</p>
              <AccountStatusBadge
                label={checkedIn ? t('checkinCheckedIn') : t('checkinPending')}
                tone={checkedIn ? 'success' : 'warning'}
              />
            </div>
            <p className="mt-1 text-xs text-ink-secondary">{t('checkinActiveHint')}</p>
          </div>
        ) : (
          <p className="text-sm text-ink-secondary">{t('empty.checkin')}</p>
        )}

        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { href: '/qr' as const, label: t('quickLinks.qr') },
              { href: '/favorites' as const, label: t('quickLinks.favorites') },
              { href: '/requests' as const, label: t('quickLinks.requests') },
              { href: '/settings' as const, label: t('quickLinks.settings') },
            ] as const
          ).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[12px] border border-border/70 bg-surface px-3 py-2.5 text-center text-sm font-medium text-ink transition-colors hover:bg-canvas"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </AnalyticsSectionCard>
  );
};
