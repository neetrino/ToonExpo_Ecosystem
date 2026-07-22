'use client';

import { Heart, Inbox, QrCode, ScanLine } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { AccountStatCard } from '@/features/buyer/components/account/account-stat-card';
import { useBuyerQrScansQuery, useBuyerRequestsQuery } from '@/features/buyer/hooks/use-buyer';
import { useBuyerCheckInQuery } from '@/features/buyer/hooks/use-buyer-checkin';
import { useBuyerFavoritesQuery } from '@/features/buyer/hooks/use-favorites';
import { Skeleton } from '@/shared/ui/skeleton';

/**
 * Buyer overview quick stats using live account APIs.
 */
export const AccountOverviewStats = () => {
  const t = useTranslations('Profile.dashboard');
  const locale = useLocale();
  const favoritesQuery = useBuyerFavoritesQuery(locale);
  const requestsQuery = useBuyerRequestsQuery(1);
  const checkInQuery = useBuyerCheckInQuery();
  const scansQuery = useBuyerQrScansQuery();

  const isLoading =
    favoritesQuery.isLoading ||
    requestsQuery.isLoading ||
    checkInQuery.isLoading ||
    scansQuery.isLoading;

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const favoritesCount = favoritesQuery.data?.items.length ?? 0;
  const requestsCount = requestsQuery.data?.meta.total ?? requestsQuery.data?.data.length ?? 0;
  const scansCount = scansQuery.data?.data.length ?? 0;
  const checkedIn = Boolean(checkInQuery.data?.current?.checkedIn);
  const checkInValue = checkInQuery.data?.current
    ? checkedIn
      ? t('checkinCheckedIn')
      : t('checkinPending')
    : t('checkinNone');

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <AccountStatCard
        href="/qr"
        icon={QrCode}
        label={t('qrLabel')}
        value={t('qrReady')}
        hint={t('scansHint', { count: scansCount })}
      />
      <AccountStatCard
        href="/favorites"
        icon={Heart}
        label={t('favoritesLabel')}
        value={String(favoritesCount)}
        hint={t('favoritesHint')}
      />
      <AccountStatCard
        href="/requests"
        icon={Inbox}
        label={t('requestsLabel')}
        value={String(requestsCount)}
        hint={t('requestsHint')}
      />
      <AccountStatCard
        href="/checkin"
        icon={ScanLine}
        label={t('checkinLabel')}
        value={checkInValue}
        hint={checkInQuery.data?.current?.eventName}
      />
    </div>
  );
};
