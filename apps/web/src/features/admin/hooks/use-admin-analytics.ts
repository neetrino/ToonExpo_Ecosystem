'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';

import { getAdminAnalyticsOverview } from '@/features/admin/api/admin-analytics-api';
import { adminAnalyticsQueryKey } from '@/features/admin/constants';
import { resolveAnalyticsDateRange } from '@/features/analytics/utils/resolve-analytics-date-range';

export const useAdminAnalyticsOverviewQuery = () => {
  const searchParams = useSearchParams();
  const preset = searchParams.get('preset');
  const range = useMemo(() => resolveAnalyticsDateRange(preset), [preset]);

  return useQuery({
    queryKey: adminAnalyticsQueryKey(range.from, range.to),
    queryFn: () => getAdminAnalyticsOverview({ from: range.from, to: range.to }),
  });
};
