'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import { loadProjectStatusCounts } from '@/lib/builder/queries';
import { loadCompanyActiveBooth } from '@/lib/exhibition/venue-queries';

type OverviewData = {
  counts: Awaited<ReturnType<typeof loadProjectStatusCounts>>;
  booth: Awaited<ReturnType<typeof loadCompanyActiveBooth>>;
};

export function PortalOverviewClient() {
  const t = useTranslations('portal.overview');
  const [data, setData] = useState<OverviewData | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const builderContext = await assertBuilderSession();
      if (!builderContext || cancelled) {
        return;
      }
      const [counts, booth] = await Promise.all([
        loadProjectStatusCounts(builderContext.companyId),
        loadCompanyActiveBooth(builderContext.companyId),
      ]);
      if (cancelled) {
        return;
      }
      setData({ counts, booth });
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

  const stats = [
    { key: 'draft', value: data.counts.draft },
    { key: 'published', value: data.counts.published },
    { key: 'archived', value: data.counts.archived },
  ] as const;

  return (
    <section>
      <h2 className="portal-page__title">{t('title')}</h2>
      {data.booth ? (
        <p className="portal-visual-map-hint">
          {t('booth', {
            code: data.booth.code,
            label: data.booth.label,
            event: data.booth.eventName,
          })}
        </p>
      ) : null}
      <div className="portal-stats">
        {stats.map((stat) => (
          <article key={stat.key} className="portal-stat">
            <p className="portal-stat__label">{t(`stats.${stat.key}`)}</p>
            <p className="portal-stat__value">{stat.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
