import type { PublicCanvas, PublicProjectDetail } from '@toonexpo/contracts';
import { slugSchema } from '@toonexpo/contracts';
import type { ApartmentStatus } from '@toonexpo/domain';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { auth } from '@/auth';
import { ProjectRequestCta } from '@/components/public-request/public-request-sheet';
import { scheduleAnalyticsEvent } from '@/lib/analytics/record-event';
import { getPublishedProjectBySlug } from '@/lib/catalog/queries';
import { loadProjectVisualMaps } from '@/lib/visual-map/load-project-visual-maps';

import { ProjectBuildings } from './project-buildings';
import { ProjectBuilderBlock } from './project-builder-block';
import { ProjectGallery } from './project-gallery';
import { PublicVisualCanvas } from '@/components/visual-map/public-visual-canvas';

type ProjectDetailPageProps = {
  params: Promise<{ locale: string; companySlug: string; projectSlug: string }>;
};

function ProjectDetailView({
  project,
  locale,
  tableLabels,
  statusLabels,
  galleryLabel,
  buildingsLabel,
  visualMapLabel,
  floorPlanLabel,
  builderLabels,
  prefill,
  projectCanvas,
  floorCanvases,
}: {
  project: PublicProjectDetail;
  locale: string;
  tableLabels: {
    code: string;
    rooms: string;
    areaSqm: string;
    priceAmd: string;
    status: string;
    request: string;
    noValue: string;
    priceByRequest: string;
    priceHidden: string;
    priceLoginRequired: string;
  };
  statusLabels: Record<ApartmentStatus, string>;
  galleryLabel: string;
  buildingsLabel: string;
  visualMapLabel: string;
  floorPlanLabel: string;
  builderLabels: {
    title: string;
    phone: string;
    email: string;
    website: string;
    noValue: string;
  };
  prefill?: { name?: string; email?: string; phone?: string };
  projectCanvas: PublicCanvas | null;
  floorCanvases: Record<string, PublicCanvas>;
}) {
  return (
    <article className="catalog-detail">
      <header className="catalog-detail__header">
        <h1 className="catalog-detail__title">{project.name}</h1>
        <p className="catalog-detail__company">{project.companyName}</p>
        {project.city || project.address ? (
          <p className="catalog-detail__location">
            {[project.city, project.address].filter(Boolean).join(' · ')}
          </p>
        ) : null}
        {project.description ? (
          <p className="catalog-detail__description">{project.description}</p>
        ) : null}
        <div className="catalog-detail__actions">
          <ProjectRequestCta
            locale={locale}
            projectId={project.id}
            projectName={project.name}
            prefill={prefill}
          />
        </div>
      </header>

      <ProjectGallery
        media={project.media}
        projectName={project.name}
        galleryLabel={galleryLabel}
      />
      <ProjectBuilderBlock
        companyName={project.companyName}
        companyDescription={project.companyDescription}
        companyLogoUrl={project.companyLogoUrl}
        companyPhone={project.companyPhone}
        companyEmail={project.companyEmail}
        companyWebsite={project.companyWebsite}
        labels={builderLabels}
      />
      {projectCanvas ? <PublicVisualCanvas canvas={projectCanvas} title={visualMapLabel} /> : null}
      <ProjectBuildings
        buildings={project.buildings}
        locale={locale}
        companySlug={project.companySlug}
        projectSlug={project.slug}
        projectId={project.id}
        projectName={project.name}
        tableLabels={tableLabels}
        statusLabels={statusLabels}
        buildingsLabel={buildingsLabel}
        prefill={prefill}
        floorCanvases={floorCanvases}
        floorPlanLabel={floorPlanLabel}
      />
    </article>
  );
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { locale, companySlug, projectSlug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('catalog');

  const parsedCompanySlug = slugSchema.safeParse(companySlug);
  const parsedProjectSlug = slugSchema.safeParse(projectSlug);
  if (!parsedCompanySlug.success || !parsedProjectSlug.success) {
    notFound();
  }

  const session = await auth();
  const isAuthenticated = Boolean(session?.user);

  const loaded = await getPublishedProjectBySlug(
    parsedCompanySlug.data,
    parsedProjectSlug.data,
    isAuthenticated,
  );
  if (!loaded) {
    notFound();
  }

  const { project, companyId } = loaded;
  scheduleAnalyticsEvent({
    type: 'PROJECT_VIEW',
    companyId,
    projectId: project.id,
  });

  const { projectCanvas, floorCanvases } = await loadProjectVisualMaps(
    project.id,
    project.buildings,
  );

  const prefill = session?.user
    ? {
        name: session.user.name ?? undefined,
        email: session.user.email ?? undefined,
      }
    : undefined;

  const tableLabels = {
    code: t('detail.table.code'),
    rooms: t('detail.table.rooms'),
    areaSqm: t('detail.table.areaSqm'),
    priceAmd: t('detail.table.priceAmd'),
    status: t('detail.table.status'),
    request: t('detail.table.request'),
    noValue: t('detail.noValue'),
    priceByRequest: t('apartment.priceByRequest'),
    priceHidden: t('apartment.priceHidden'),
    priceLoginRequired: t('apartment.priceLoginRequired'),
  };
  const statusLabels: Record<ApartmentStatus, string> = {
    AVAILABLE: t('apartmentStatus.AVAILABLE'),
    RESERVED: t('apartmentStatus.RESERVED'),
    SOLD: t('apartmentStatus.SOLD'),
  };

  return (
    <section className="catalog-page">
      <ProjectDetailView
        project={project}
        locale={locale}
        tableLabels={tableLabels}
        statusLabels={statusLabels}
        galleryLabel={t('detail.gallery')}
        buildingsLabel={t('detail.buildings')}
        visualMapLabel={t('visualMap.projectTitle')}
        floorPlanLabel={t('visualMap.floorTitle')}
        builderLabels={{
          title: t('detail.builder.title'),
          phone: t('detail.builder.phone'),
          email: t('detail.builder.email'),
          website: t('detail.builder.website'),
          noValue: t('detail.noValue'),
        }}
        prefill={prefill}
        projectCanvas={projectCanvas}
        floorCanvases={floorCanvases}
      />
    </section>
  );
}
