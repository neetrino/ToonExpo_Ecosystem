'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { BuilderAnalyticsView } from '@/components/analytics/builder-analytics-view';
import { loadBuilderAnalytics, type BuilderAnalyticsSnapshot } from '@/lib/analytics/builder-queries';
import { assertBuilderSession } from '@/lib/builder/assert-builder-session';

export function PortalAnalyticsClient() {
  const t = useTranslations('portal.analytics');
  const [data, setData] = useState<BuilderAnalyticsSnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const builderContext = await assertBuilderSession();
      if (!builderContext || cancelled) {
        return;
      }
      const next = await loadBuilderAnalytics(builderContext.companyId);
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

  return <BuilderAnalyticsView t={t} data={data} />;
}
