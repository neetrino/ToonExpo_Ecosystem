import Image from 'next/image';
import type { ReactNode } from 'react';

import { cn } from '@/shared/ui/cn';

type MarketingPageIntroProps = {
  title: string;
  description?: string | undefined;
  imageSrc: string;
  imageAlt?: string | undefined;
  action?: ReactNode | undefined;
  className?: string | undefined;
};

/**
 * Photo-led page intro for public catalog/marketing routes.
 */
export const MarketingPageIntro = ({
  title,
  description,
  imageSrc,
  imageAlt = '',
  action,
  className,
}: MarketingPageIntroProps) => {
  return (
    <header
      className={cn(
        'relative mb-10 overflow-hidden rounded-lg border border-border/60 bg-surface-inverse',
        className,
      )}
    >
      <div className="grid min-h-44 sm:min-h-52 lg:grid-cols-2 lg:min-h-56">
        <div className="relative z-10 flex flex-col justify-center gap-3 px-6 py-8 sm:px-8 lg:px-10">
          <h1 className="text-page-title text-on-dark">{title}</h1>
          {description ? (
            <p className="max-w-md text-sm leading-relaxed text-on-dark/70">{description}</p>
          ) : null}
          {action}
        </div>
        <div className="relative min-h-36 lg:min-h-full">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="banner-media-drift object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-inverse via-surface-inverse/55 to-transparent max-lg:from-surface-inverse/80 max-lg:via-transparent" />
        </div>
      </div>
    </header>
  );
};
