import Image from 'next/image';
import { Play } from 'lucide-react';

import { cn } from '@/shared/ui/cn';

type ProjectCatalogMediaPosterProps = {
  title: string;
  imageSrc: string;
};

/**
 * Aspect-video poster with play affordance (video / interactive tour placeholders).
 */
export const ProjectCatalogMediaPoster = ({ title, imageSrc }: ProjectCatalogMediaPosterProps) => {
  return (
    <div
      className={cn(
        'relative aspect-video overflow-hidden rounded-xl bg-ink',
        'ring-1 ring-header-border',
      )}
    >
      <Image
        src={imageSrc}
        alt={title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 720px"
      />
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
    </div>
  );
};
