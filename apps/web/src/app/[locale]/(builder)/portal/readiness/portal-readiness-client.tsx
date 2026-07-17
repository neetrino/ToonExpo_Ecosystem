'use client';

import type { ReadinessStatus } from '@toonexpo/domain';
import { READINESS_STATUSES } from '@toonexpo/domain';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import {
  buildProviderSuggestions,
  listBuilderAssessments,
  loadPublishedServiceProviders,
  type CategoryProviderGroup,
} from '@/lib/readiness/builder-queries';
import type { BuilderReadinessAssessment } from '@toonexpo/contracts';

import { ReadinessAssessmentCard } from './readiness-assessment-card';
import { ReadinessProvidersSection } from './readiness-providers-section';

type ReadinessPageData = {
  assessments: BuilderReadinessAssessment[];
  providerGroups: CategoryProviderGroup[];
};

export function PortalReadinessClient() {
  const locale = useLocale();
  const t = useTranslations('portal.readiness');
  const tStatus = useTranslations('portal.readiness.statuses');
  const tCategories = useTranslations('portal.readiness.categories');
  const [data, setData] = useState<ReadinessPageData | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const builderContext = await assertBuilderSession();
      if (!builderContext || cancelled) {
        return;
      }
      const [assessments, providers] = await Promise.all([
        listBuilderAssessments(builderContext.companyId),
        loadPublishedServiceProviders(),
      ]);
      if (cancelled) {
        return;
      }
      setData({
        assessments,
        providerGroups: buildProviderSuggestions(assessments, providers),
      });
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

  const statusLabels = Object.fromEntries(
    READINESS_STATUSES.map((status) => [status, tStatus(status)]),
  ) as Record<ReadinessStatus, string>;

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  if (data.assessments.length === 0) {
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
        {data.assessments.map((assessment) => (
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

      {data.providerGroups.length > 0 ? (
        <ReadinessProvidersSection
          groups={data.providerGroups}
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
