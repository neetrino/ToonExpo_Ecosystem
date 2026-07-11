import type { PublicProjectSummary } from '@toonexpo/contracts';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { getPublishedProjects } from '@/lib/catalog/queries';

type ProjectsPageProps = {
  params: Promise<{ locale: string }>;
};

function ProjectCard({ project }: { project: PublicProjectSummary }) {
  const href = `/projects/${project.companySlug}/${project.slug}`;

  return (
    <Link href={href} className="catalog-card">
      {project.coverImageUrl ? (
        <Image
          src={project.coverImageUrl}
          alt={project.name}
          width={640}
          height={400}
          className="catalog-card__image"
        />
      ) : (
        <div className="catalog-card__placeholder" aria-hidden="true" />
      )}
      <div className="catalog-card__body">
        <h2 className="catalog-card__title">{project.name}</h2>
        {project.city ? <p className="catalog-card__meta">{project.city}</p> : null}
        <p className="catalog-card__company">{project.companyName}</p>
      </div>
    </Link>
  );
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('catalog');
  const projects = await getPublishedProjects();

  return (
    <section className="catalog-page">
      <header className="catalog-page__header">
        <h1 className="catalog-page__title">{t('list.title')}</h1>
        <p className="catalog-page__subtitle">{t('list.subtitle')}</p>
      </header>

      {projects.length === 0 ? (
        <p className="catalog-empty">{t('list.empty')}</p>
      ) : (
        <div className="catalog-grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}
