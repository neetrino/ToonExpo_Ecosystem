import type { PublicProjectDetail } from '@toonexpo/contracts';
import { slugSchema } from '@toonexpo/contracts';
import type { ApartmentStatus } from '@toonexpo/domain';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { auth } from '@/auth';
import { ProjectRequestCta } from '@/components/public-request/public-request-sheet';
import { getPublishedProjectBySlug } from '@/lib/catalog/queries';

import { ProjectBuildings } from './project-buildings';
import { ProjectGallery } from './project-gallery';

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
  prefill,
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
  };
  statusLabels: Record<ApartmentStatus, string>;
  galleryLabel: string;
  buildingsLabel: string;
  prefill?: { name?: string; email?: string; phone?: string };
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
      <ProjectBuildings
        buildings={project.buildings}
        locale={locale}
        projectId={project.id}
        projectName={project.name}
        tableLabels={tableLabels}
        statusLabels={statusLabels}
        buildingsLabel={buildingsLabel}
        prefill={prefill}
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

  const project = await getPublishedProjectBySlug(parsedCompanySlug.data, parsedProjectSlug.data);
  if (!project) {
    notFound();
  }

  const session = await auth();
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
        prefill={prefill}
      />
    </section>
  );
}
