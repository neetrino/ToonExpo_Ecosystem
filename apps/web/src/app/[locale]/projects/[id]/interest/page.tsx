import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache } from 'react';

import { QrInterestLanding } from '@/features/buyer/components/qr-interest-landing';
import { QrInterestRequestSection } from '@/features/buyer/components/qr-interest-request-section';
import { getProject } from '@/features/catalog/api/catalog-api';

type ProjectInterestPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

const loadProject = cache((id: string, locale: string) => getProject(id, { locale }));

export const generateMetadata = async ({ params }: ProjectInterestPageProps): Promise<Metadata> => {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'Catalog' });
  const project = await loadProject(id, locale);

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
  const { locale, id } = await params;
  setRequestLocale(locale);

  const project = await loadProject(id, locale);
  if (!project) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'Catalog' });

  return (
    <div className="min-h-screen bg-canvas">
      <main>
        <QrInterestLanding
          title={project.name}
          subtitle={t('qrInterest.subtitleProject', { builder: project.builder.name })}
          imageUrl={project.cover?.fileUrl ?? null}
          imageAlt={project.cover?.altText ?? project.name}
          detailsHref={`/projects/${project.id}`}
          detailsLabel={t('qrInterest.viewDetails')}
        >
          <QrInterestRequestSection projectId={project.id} />
        </QrInterestLanding>
      </main>
    </div>
  );
}
