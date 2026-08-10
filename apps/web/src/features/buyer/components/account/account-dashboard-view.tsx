'use client';

import {
  Heart,
  Inbox,
  QrCode,
  ScanLine,
  type LucideIcon,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  CheckInShortcutsSection,
  DashboardRequestList,
  DashboardScanList,
  FavoritesSection,
} from '@/features/buyer/components/account/account-dashboard-lists';
import { useBuyerQrScansQuery, useBuyerRequestsQuery } from '@/features/buyer/hooks/use-buyer';
import { useBuyerCheckInQuery } from '@/features/buyer/hooks/use-buyer-checkin';
import { useBuyerFavoritesQuery } from '@/features/buyer/hooks/use-favorites';
import {
  AnalyticsKpiCard,
  type AnalyticsKpiTone,
} from '@/features/analytics/components/analytics-kpi-card';
import { AnalyticsSectionCard } from '@/features/analytics/components/analytics-section-card';
import { Link } from '@/i18n/navigation';
import {
  LIST_CARD_STAGGER_MS,
  LIST_CONTENT_BASE_DELAY_MS,
  StaggerGroup,
} from '@/shared/ui/motion';
import { Skeleton } from '@/shared/ui/skeleton';

const PREVIEW_ITEM_LIMIT = 5;
const SECTION_BASE_DELAY_MS = 220;

type KpiItem = {
  key: string;
  href: '/qr' | '/favorites' | '/requests' | '/checkin';
  label: string;
  value: number;
  icon: LucideIcon;
  tone: AnalyticsKpiTone;
  trendLabel: string;
};

/**
 * Buyer account dashboard — admin-analytics layout with live account data.
 */
export const AccountDashboardView = () => {
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
      <div className="flex flex-col gap-6" aria-busy="true">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const favorites = favoritesQuery.data?.items ?? [];
  const requests = requestsQuery.data?.data ?? [];
  const scans = scansQuery.data?.data ?? [];
  const favoritesCount = favorites.length;
  const requestsCount = requestsQuery.data?.meta.total ?? requests.length;
  const scansCount = scans.length;
  const checkedIn = Boolean(checkInQuery.data?.current?.checkedIn);
  const checkInHistoryCount = checkInQuery.data?.history.length ?? 0;

  const kpis: KpiItem[] = [
    {
      key: 'favorites',
      href: '/favorites',
      label: t('favoritesLabel'),
      value: favoritesCount,
      icon: Heart,
      tone: 'teal',
      trendLabel: t('favoritesHint'),
    },
    {
      key: 'requests',
      href: '/requests',
      label: t('requestsLabel'),
      value: requestsCount,
      icon: Inbox,
      tone: 'accent',
      trendLabel: t('requestsHint'),
    },
    {
      key: 'scans',
      href: '/qr',
      label: t('scansLabel'),
      value: scansCount,
      icon: QrCode,
      tone: 'blue',
      trendLabel: t('scansHint', { count: scansCount }),
    },
    {
      key: 'checkin',
      href: '/checkin',
      label: t('checkinLabel'),
      value: checkInHistoryCount,
      icon: ScanLine,
      tone: 'green',
      trendLabel: checkInQuery.data?.current
        ? checkedIn
          ? t('checkinCheckedIn')
          : t('checkinPending')
        : t('checkinNone'),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <StaggerGroup
        force
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 [&>*]:h-full [&>*]:min-w-0"
        staggerMs={LIST_CARD_STAGGER_MS}
        baseDelayMs={LIST_CONTENT_BASE_DELAY_MS}
        durationMs={520}
      >
        {kpis.map((item) => (
          <Link key={item.key} href={item.href} className="block h-full min-w-0">
            <AnalyticsKpiCard
              label={item.label}
              value={item.value}
              icon={item.icon}
              tone={item.tone}
              changePercent={null}
              trendLabel={item.trendLabel}
              className="h-full"
            />
          </Link>
        ))}
      </StaggerGroup>

      <StaggerGroup
        force
        className="grid grid-cols-1 gap-4 xl:grid-cols-2 [&>*]:h-full [&>*]:min-w-0"
        staggerMs={90}
        baseDelayMs={SECTION_BASE_DELAY_MS}
        durationMs={560}
      >
        <AnalyticsSectionCard
          title={t('sections.recentRequests')}
          empty={requests.length === 0}
          emptyLabel={t('empty.requests')}
          className="h-full"
          action={
            <Link href="/requests" className="text-sm font-medium text-brand-secondary hover:underline">
              {t('viewAll')}
            </Link>
          }
        >
          <DashboardRequestList items={requests.slice(0, PREVIEW_ITEM_LIMIT)} locale={locale} />
        </AnalyticsSectionCard>

        <AnalyticsSectionCard
          title={t('sections.recentScans')}
          empty={scans.length === 0}
          emptyLabel={t('empty.scans')}
          className="h-full"
          action={
            <Link href="/qr" className="text-sm font-medium text-brand-secondary hover:underline">
              {t('viewAll')}
            </Link>
          }
        >
          <DashboardScanList items={scans.slice(0, PREVIEW_ITEM_LIMIT)} locale={locale} />
        </AnalyticsSectionCard>
      </StaggerGroup>

      <StaggerGroup
        force
        className="grid grid-cols-1 gap-4 xl:grid-cols-2 [&>*]:h-full [&>*]:min-w-0"
        staggerMs={90}
        baseDelayMs={SECTION_BASE_DELAY_MS + 120}
        durationMs={560}
      >
        <FavoritesSection favorites={favorites} />
        <CheckInShortcutsSection
          eventName={checkInQuery.data?.current?.eventName}
          checkedIn={checkedIn}
          hasCurrent={Boolean(checkInQuery.data?.current)}
        />
      </StaggerGroup>
    </div>
  );
};
