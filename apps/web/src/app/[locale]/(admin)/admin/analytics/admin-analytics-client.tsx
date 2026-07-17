'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { AdminAnalyticsView } from '@/components/analytics/admin-analytics-view';
import { loadAdminAnalytics, type AdminAnalyticsSnapshot } from '@/lib/analytics/admin-queries';

export function AdminAnalyticsClient() {
  const t = useTranslations('admin.analytics');
  const [data, setData] = useState<AdminAnalyticsSnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const next = await loadAdminAnalytics();
      if (cancelled) {
        return;
      }
      setData(next);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-[var(--te-muted)]" role="status">
        Loading…
      </div>
    );
  }

  return <AdminAnalyticsView t={t} data={data} />;
}
