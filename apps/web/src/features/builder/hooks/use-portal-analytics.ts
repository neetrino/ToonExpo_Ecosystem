'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';

import { getPortalAnalyticsOverview } from '@/features/builder/api/portal-analytics-api';
import { portalAnalyticsQueryKey } from '@/features/builder/constants';
import { resolveAnalyticsDateRange } from '@/features/analytics/utils/resolve-analytics-date-range';

export const usePortalAnalyticsOverviewQuery = () => {
  const searchParams = useSearchParams();
  const preset = searchParams.get('preset');
  const range = useMemo(() => resolveAnalyticsDateRange(preset), [preset]);

  return useQuery({
    queryKey: portalAnalyticsQueryKey(range.from, range.to),
    queryFn: () => getPortalAnalyticsOverview({ from: range.from, to: range.to }),
  });
};
