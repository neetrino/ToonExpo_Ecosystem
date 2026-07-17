import { setRequestLocale } from 'next-intl/server';

import { ProjectDetailClient } from './project-detail-client';

type ProjectDetailPageProps = {
  params: Promise<{ locale: string; projectId: string }>;
};

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { locale, projectId } = await params;
  setRequestLocale(locale);
  return <ProjectDetailClient projectId={projectId} />;
}
