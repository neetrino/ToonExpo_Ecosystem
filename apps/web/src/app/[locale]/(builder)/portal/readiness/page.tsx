import type { ReadinessStatus } from '@toonexpo/domain';
import { READINESS_STATUSES } from '@toonexpo/domain';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import {
  buildProviderSuggestions,
  listBuilderAssessments,
  loadPublishedServiceProviders,
} from '@/lib/readiness/builder-queries';

import { ReadinessAssessmentCard } from './readiness-assessment-card';
import { ReadinessProvidersSection } from './readiness-providers-section';

type PortalReadinessPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PortalReadinessPage({ params }: PortalReadinessPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const builderContext = await assertBuilderSession();
  if (!builderContext) {
    return null;
  }

  const [t, tStatus, tCategories, assessments, providers] = await Promise.all([
    getTranslations('portal.readiness'),
    getTranslations('portal.readiness.statuses'),
    getTranslations('portal.readiness.categories'),
    listBuilderAssessments(builderContext.companyId),
    loadPublishedServiceProviders(),
  ]);

  const statusLabels = Object.fromEntries(
    READINESS_STATUSES.map((status) => [status, tStatus(status)]),
  ) as Record<ReadinessStatus, string>;

  const providerGroups = buildProviderSuggestions(assessments, providers);
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  if (assessments.length === 0) {
    return (
      <section>
        <h2 className="portal-page__title">{t('title')}</h2>
        <p className="portal-empty">{t('empty')}</p>
      </section>
    );
  }

  return (
    <section>
      <div className="portal-page__header">
        <div>
          <h2 className="portal-page__title">{t('title')}</h2>
          <p className="portal-page__subtitle">{t('subtitle')}</p>
        </div>
      </div>

      <div className="portal-section">
        {assessments.map((assessment) => (
          <ReadinessAssessmentCard
            key={assessment.id}
            assessment={assessment}
            statusLabels={statusLabels}
            categoryLabel={(key, fallback) => (tCategories.has(key) ? tCategories(key) : fallback)}
            labels={{
              overallScore: t('overallScore'),
              status: t('status'),
              recommendation: t('recommendation'),
              requiredActions: t('requiredActions'),
              lastUpdated: t('lastUpdated'),
              companyTarget: t('targets.BUILDER_COMPANY'),
              projectTarget: t('targets.PROJECT'),
              categories: t('categoriesTitle'),
              helpProviders: t('helpProviders'),
            }}
            formatDate={(date) => dateFormatter.format(date)}
          />
        ))}
      </div>

      {providerGroups.length > 0 ? (
        <ReadinessProvidersSection
          groups={providerGroups}
          categoryLabel={(key, fallback) => (tCategories.has(key) ? tCategories(key) : fallback)}
          labels={{
            title: t('providers.title'),
            description: t('providers.description'),
            openProfile: t('providers.openProfile'),
            contact: t('providers.contact'),
          }}
        />
      ) : null}
    </section>
  );
}
