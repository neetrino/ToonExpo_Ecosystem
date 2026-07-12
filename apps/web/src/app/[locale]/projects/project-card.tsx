import type { PublicProjectSummary } from '@toonexpo/contracts';
import Image from 'next/image';

import { Link } from '@/i18n/navigation';
import { CATALOG_IMAGE_HEIGHT, CATALOG_IMAGE_WIDTH } from '@/lib/catalog/image-dimensions';

export function ProjectCard({ project }: { project: PublicProjectSummary }) {
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
        <h2 className="catalog-card__title">{project.name}</h2>
        {project.city ? <p className="catalog-card__meta">{project.city}</p> : null}
        <p className="catalog-card__company">{project.companyName}</p>
      </div>
    </Link>
  );
}
