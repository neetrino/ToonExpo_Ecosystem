import type { PublicBuilderDetail } from '@toonexpo/contracts';
import { isHttpUrl } from '@toonexpo/contracts';
import type { PublicProjectSummary } from '@toonexpo/contracts';
import Image from 'next/image';

import { Link } from '@/i18n/navigation';
import { CATALOG_IMAGE_HEIGHT, CATALOG_IMAGE_WIDTH } from '@/lib/catalog/image-dimensions';

type BuilderDetailViewProps = {
  builder: PublicBuilderDetail;
  labels: {
    contacts: string;
    phone: string;
    email: string;
    website: string;
    city: string;
    address: string;
    projects: string;
    noValue: string;
  };
};

function BuilderLogo({ builder }: { builder: PublicBuilderDetail }) {
  if (builder.logoUrl) {
    return <img src={builder.logoUrl} alt="" className="catalog-builder-detail__logo-image" />;
  }

  const initial = builder.name.trim().charAt(0).toUpperCase() || '?';

  return (
    <div className="catalog-builder-detail__logo-fallback" aria-hidden="true">
      {initial}
    </div>
  );
}

function ProjectCard({ project }: { project: PublicProjectSummary }) {
  const href = `/projects/${project.companySlug}/${project.slug}`;

  return (
    <Link href={href} className="catalog-card">
      {project.coverImageUrl ? (
        <Image
          src={project.coverImageUrl}
          alt={project.name}
          width={CATALOG_IMAGE_WIDTH}
          height={CATALOG_IMAGE_HEIGHT}
          className="catalog-card__image"
        />
      ) : (
        <div className="catalog-card__placeholder" aria-hidden="true" />
      )}
      <div className="catalog-card__body">
        <h3 className="catalog-card__title">{project.name}</h3>
        {project.city ? <p className="catalog-card__meta">{project.city}</p> : null}
      </div>
    </Link>
  );
}

export function BuilderDetailView({ builder, labels }: BuilderDetailViewProps) {
  return (
    <article className="catalog-detail catalog-builder-detail">
      <header className="catalog-builder-detail__header">
        <div className="catalog-builder-detail__logo">
          <BuilderLogo builder={builder} />
        </div>
        <div className="catalog-builder-detail__intro">
          <h1 className="catalog-detail__title">{builder.name}</h1>
          {builder.city ? (
            <p className="catalog-builder-detail__city">
              {labels.city}: {builder.city}
            </p>
          ) : null}
          {builder.description ? (
            <p className="catalog-detail__description">{builder.description}</p>
          ) : null}
        </div>
      </header>

      {builder.phone || builder.email || builder.website || builder.address ? (
        <section className="catalog-builder-detail__section">
          <h2 className="catalog-section-title">{labels.contacts}</h2>
          <ul className="catalog-builder-detail__contacts">
            {builder.phone ? (
              <li>
                <span className="catalog-builder-detail__contact-label">{labels.phone}</span>
                <a href={`tel:${builder.phone}`}>{builder.phone}</a>
              </li>
            ) : null}
            {builder.email ? (
              <li>
                <span className="catalog-builder-detail__contact-label">{labels.email}</span>
                <a href={`mailto:${builder.email}`}>{builder.email}</a>
              </li>
            ) : null}
            {builder.website ? (
              <li>
                <span className="catalog-builder-detail__contact-label">{labels.website}</span>
                {isHttpUrl(builder.website) ? (
                  <a href={builder.website} rel="noopener noreferrer" target="_blank">
                    {builder.website}
                  </a>
                ) : (
                  <span>{builder.website}</span>
                )}
              </li>
            ) : null}
            {builder.address ? (
              <li>
                <span className="catalog-builder-detail__contact-label">{labels.address}</span>
                <span>{builder.address}</span>
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}

      {builder.projects.length > 0 ? (
        <section className="catalog-builder-detail__section">
          <h2 className="catalog-section-title">{labels.projects}</h2>
          <div className="catalog-grid">
            {builder.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
