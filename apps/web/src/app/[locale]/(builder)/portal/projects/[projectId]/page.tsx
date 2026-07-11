import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import { loadCompanyProjectDetail } from '@/lib/builder/queries';

import { BuildingsSection } from './buildings-section';
import { ProjectHeader } from './project-header';

type ProjectDetailPageProps = {
  params: Promise<{ locale: string; projectId: string }>;
};

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { locale, projectId } = await params;
  setRequestLocale(locale);

  const builderContext = await assertBuilderSession();
  if (!builderContext) {
    return null;
  }

  const project = await loadCompanyProjectDetail(builderContext.companyId, projectId);
  if (!project) {
    notFound();
  }

  const [t, tStatus, tApartmentStatus] = await Promise.all([
    getTranslations('portal.projectDetail'),
    getTranslations('portal.projects.status'),
    getTranslations('portal.apartmentStatus'),
  ]);

  const priceFormatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'AMD',
    maximumFractionDigits: 0,
  });

  return (
    <section>
      <ProjectHeader locale={locale} project={project} statusLabel={tStatus(project.status)} />

      <BuildingsSection
        locale={locale}
        project={project}
        labels={{
          title: t('buildings.title'),
          addBuilding: t('buildings.addBuilding'),
          empty: t('buildings.empty'),
          editBuilding: t('buildings.editBuilding'),
          addFloor: t('buildings.addFloor'),
          floors: t('buildings.emptyFloors'),
          level: t('buildings.level'),
          editFloor: t('buildings.editFloor'),
          apartment: {
            title: t('apartments.title'),
            code: t('apartments.columns.code'),
            rooms: t('apartments.columns.rooms'),
            areaSqm: t('apartments.columns.areaSqm'),
            priceAmd: t('apartments.columns.priceAmd'),
            status: t('apartments.columns.status'),
            actions: t('apartments.columns.actions'),
            noValue: t('apartments.noValue'),
            edit: t('apartments.edit'),
            addApartment: t('apartments.addApartment'),
          },
        }}
        statusLabels={{
          AVAILABLE: tApartmentStatus('AVAILABLE'),
          RESERVED: tApartmentStatus('RESERVED'),
          SOLD: tApartmentStatus('SOLD'),
        }}
        formatPrice={(value) => priceFormatter.format(value)}
      />
    </section>
  );
}
