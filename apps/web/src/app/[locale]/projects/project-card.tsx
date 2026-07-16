import type { PublicProjectSummary } from '@toonexpo/contracts';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import { TeBadge } from '@/components/ui/te-badge';
import { Link } from '@/i18n/navigation';
import { CATALOG_IMAGE_HEIGHT, CATALOG_IMAGE_WIDTH } from '@/lib/catalog/image-dimensions';

type ProjectCardProps = {
  project: PublicProjectSummary;
  showNewBadge?: boolean;
};

export async function ProjectCard({ project, showNewBadge = false }: ProjectCardProps) {
  const t = await getTranslations('catalog.card');
  const href = `/projects/${project.companySlug}/${project.slug}`;

  return (
    <Link href={href} className="catalog-card">
      <div className="catalog-card__media">
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
      </div>
      <div className="catalog-card__body">
        <div className="catalog-card__badges">
          {showNewBadge ? <TeBadge tone="new">{t('new')}</TeBadge> : null}
          {project.city ? <TeBadge tone="verified">{project.city}</TeBadge> : null}
        </div>
        <h2 className="catalog-card__title">{project.name}</h2>
        <p className="catalog-card__company">{project.companyName}</p>
      </div>
    </Link>
  );
}
