'use client';

import { notFound } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import { loadCompanyProjectDetail, type BuilderProjectDetail } from '@/lib/builder/queries';
import { evaluateProjectCompleteness } from '@/lib/projects/project-completeness';
import { listCanvasesForProject, type BuilderCanvasSummary } from '@/lib/visual-map/queries';

import { BuildingsSection } from './buildings-section';
import { MediaSection } from './media-section';
import { ProjectHeader } from './project-header';
import { VisualMapsSection } from './visual-maps-section';

type ProjectDetailData = {
  project: BuilderProjectDetail;
  canvases: BuilderCanvasSummary[];
};

type ProjectDetailClientProps = {
  projectId: string;
};

export function ProjectDetailClient({ projectId }: ProjectDetailClientProps) {
  const locale = useLocale();
  const t = useTranslations('portal.projectDetail');
  const tStatus = useTranslations('portal.projects.status');
  const tApartmentStatus = useTranslations('portal.apartmentStatus');
  const tVisualMap = useTranslations('portal.visualMap');
  const tMedia = useTranslations('portal.mediaForm');
  const [data, setData] = useState<ProjectDetailData | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const builderContext = await assertBuilderSession();
      if (!builderContext || cancelled) {
        return;
      }
      const [project, canvases] = await Promise.all([
        loadCompanyProjectDetail(builderContext.companyId, projectId),
        listCanvasesForProject(builderContext.companyId, projectId),
      ]);
      if (cancelled) {
        return;
      }
      if (!project) {
        setMissing(true);
        return;
      }
      setData({ project, canvases });
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (missing) {
    notFound();
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-[var(--te-muted)]" role="status">
        Loading…
      </div>
    );
  }

  const { project, canvases } = data;
  const completeness = evaluateProjectCompleteness({
    description: project.description,
    hasCoverMedia: project.media.length > 0,
    hasCanvas: canvases.length > 0,
    buildings: project.buildings.map((building) => ({
      status: building.status,
      floors: building.floors.map((floor) => ({
        status: floor.status,
        apartmentCount: floor.apartments.length,
      })),
    })),
  });

  return (
    <section>
      <ProjectHeader
        locale={locale}
        project={project}
        statusLabel={tStatus(project.status)}
        completenessMissingKeys={completeness.missingKeys}
      />

      <VisualMapsSection
        locale={locale}
        project={project}
        canvases={canvases}
        labels={{
          title: tVisualMap('section.title'),
          newCanvas: tVisualMap('section.newCanvas'),
          empty: tVisualMap('section.empty'),
          hotspotCount: tVisualMap.raw('section.hotspotCount') as string,
          untitled: tVisualMap('section.untitled'),
          context: {
            project: tVisualMap('context.project'),
            building: tVisualMap('context.building'),
            floor: tVisualMap('context.floor'),
          },
        }}
        statusLabels={{
          DRAFT: tStatus('DRAFT'),
          PUBLISHED: tStatus('PUBLISHED'),
          ARCHIVED: tStatus('ARCHIVED'),
        }}
      />

      <MediaSection
        locale={locale}
        owner={{ projectId: project.id }}
        media={project.media}
        labels={{
          title: tMedia('section.title'),
          addMedia: tMedia('add'),
          empty: tMedia('empty'),
          edit: tMedia('edit'),
          delete: tMedia('delete'),
          coverBadge: tMedia('coverBadge'),
          coverHint: tMedia('coverHint'),
          sortOrder: tMedia('fields.sortOrder'),
          noAlt: tMedia('noAlt'),
          confirmDelete: tMedia('confirmDelete'),
        }}
      />

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
            media: t('apartments.media'),
          },
        }}
        statusLabels={{
          AVAILABLE: tApartmentStatus('AVAILABLE'),
          RESERVED: tApartmentStatus('RESERVED'),
          SOLD: tApartmentStatus('SOLD'),
        }}
        publicationStatusLabels={{
          DRAFT: tStatus('DRAFT'),
          PUBLISHED: tStatus('PUBLISHED'),
          ARCHIVED: tStatus('ARCHIVED'),
        }}
      />
    </section>
  );
}
