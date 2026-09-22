import { Play } from 'lucide-react';

import { ProjectCatalogPosterImage } from '@/features/catalog/components/project-catalog-poster-image';
import { cn } from '@/shared/ui/cn';

type ProjectCatalogMediaPosterProps = {
  title: string;
  /** Real media thumbnail when available; omit for a plain play-frame (no stock placeholder). */
  imageSrc?: string;
  /** Used when `imageSrc` is missing/tiny (e.g. YouTube without maxres). */
  imageFallbackSrc?: string;
  href?: string;
  openLabel?: string;
};

/**
 * Aspect-video poster with play affordance (video / interactive tour).
 */
export const ProjectCatalogMediaPoster = ({
  title,
  imageSrc,
  imageFallbackSrc,
  href,
  openLabel,
}: ProjectCatalogMediaPosterProps) => {
  const content = (
    <>
      {imageSrc != null ? (
        <ProjectCatalogPosterImage
          src={imageSrc}
          alt={title}
          {...(imageFallbackSrc != null ? { fallbackSrc: imageFallbackSrc } : {})}
        />
      ) : null}
      <div className="absolute inset-0 bg-ink/25" aria-hidden />
      <span
        className={cn(
          'absolute top-1/2 left-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2',
          'items-center justify-center rounded-full bg-surface-elevated/95 text-brand-deep',
          'shadow-md',
        )}
        aria-hidden
      >
        <Play className="size-6 fill-current" strokeWidth={0} />
      </span>
    </>
  );

  const frameClassName = cn(
    'relative aspect-video overflow-hidden rounded-xl bg-ink',
    'ring-1 ring-header-border',
  );

  if (href != null) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={openLabel ?? title}
        className={cn(
          frameClassName,
          'block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25',
        )}
      >
        {content}
      </a>
    );
  }

  return <div className={frameClassName}>{content}</div>;
};
