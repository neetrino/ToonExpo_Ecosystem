import Image from 'next/image';
import type { ReactNode } from 'react';

import { BackLink } from '@/shared/ui/back-link';
import { cn } from '@/shared/ui/cn';

type QrInterestLandingProps = {
  title: string;
  subtitle: string;
  imageUrl: string | null;
  imageAlt: string;
  detailsHref: string;
  detailsLabel: string;
  children: ReactNode;
  className?: string | undefined;
};

/**
 * QR scan landing shell: cover image + title + interest form slot.
 */
export const QrInterestLanding = ({
  title,
  subtitle,
  imageUrl,
  imageAlt,
  detailsHref,
  detailsLabel,
  children,
  className,
}: QrInterestLandingProps) => {
  return (
    <div className={cn('mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-8 sm:px-6', className)}>
      <BackLink href={detailsHref} label={detailsLabel} />

      <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-surface ring-1 ring-header-border">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 32rem"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-surface px-6 text-center text-sm text-header-muted">
            {title}
          </div>
        )}
      </div>

      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-ink-navy">{title}</h1>
        <p className="text-sm text-header-muted">{subtitle}</p>
      </header>

      {children}
    </div>
  );
};
