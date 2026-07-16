import { getTranslations, setRequestLocale } from 'next-intl/server';

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import { loadProjectStatusCounts } from '@/lib/builder/queries';
import { loadCompanyActiveBooth } from '@/lib/exhibition/venue-queries';

type PortalOverviewPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PortalOverviewPage({ params }: PortalOverviewPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const builderContext = await assertBuilderSession();
  if (!builderContext) {
    return null;
  }

  const [t, counts, booth] = await Promise.all([
    getTranslations('portal.overview'),
    loadProjectStatusCounts(builderContext.companyId),
    loadCompanyActiveBooth(builderContext.companyId),
  ]);

  const stats = [
    { key: 'draft', value: counts.draft },
    { key: 'published', value: counts.published },
    { key: 'archived', value: counts.archived },
  ] as const;

  return (
    <section>
      <h2 className="portal-page__title">{t('title')}</h2>
      {booth ? (
        <p className="portal-visual-map-hint">
          {t('booth', { code: booth.code, label: booth.label, event: booth.eventName })}
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
