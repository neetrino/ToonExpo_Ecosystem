import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache } from 'react';

import { QrInterestLanding } from '@/features/buyer/components/qr-interest-landing';
import { QrInterestRequestSection } from '@/features/buyer/components/qr-interest-request-section';
import { getProject } from '@/features/catalog/api/catalog-api';
import { ensureCanonicalProjectSlug } from '@/features/catalog/utils/ensure-canonical-project-slug';
import { buildProjectPublicHref } from '@/features/geo-map/public/utils/build-project-public-href';

type ProjectInterestPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

const loadProject = cache((projectSlug: string, locale: string) => getProject(projectSlug, { locale }));

export const generateMetadata = async ({ params }: ProjectInterestPageProps): Promise<Metadata> => {
  const { locale, id: projectSlug } = await params;
  const t = await getTranslations({ locale, namespace: 'Catalog' });
  const project = await loadProject(projectSlug, locale);

  if (!project) {
    return { title: t('project.notFoundTitle') };
  }

  return {
    title: t('qrInterest.metaTitleProject', { name: project.name }),
    description: t('qrInterest.metaDescription'),
  };
};

/**
 * Project QR landing — cover + notes form → builder CRM request.
 */
export default async function ProjectInterestPage({ params }: ProjectInterestPageProps) {
  const { locale, id: projectSlug } = await params;
  setRequestLocale(locale);

  const project = await loadProject(projectSlug, locale);
  if (!project) {
    notFound();
  }

  ensureCanonicalProjectSlug(project, projectSlug, locale, '/interest');

  const t = await getTranslations({ locale, namespace: 'Catalog' });

  return (
    <div className="min-h-screen bg-canvas">
      <main>
        <QrInterestLanding
          title={project.name}
          subtitle={t('qrInterest.subtitleProject', { builder: project.builder.name })}
          imageUrl={project.cover?.fileUrl ?? null}
          imageAlt={project.cover?.altText ?? project.name}
          detailsHref={buildProjectPublicHref(project.slug)}
          detailsLabel={t('qrInterest.viewDetails')}
        >
          <QrInterestRequestSection projectId={project.id} />
        </QrInterestLanding>
      </main>
    </div>
  );
}
