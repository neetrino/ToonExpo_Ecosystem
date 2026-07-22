'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { ApartmentDetailFavorite } from '@/features/buyer/components/apartment-detail-favorite';
import { CatalogRequestButton } from '@/features/buyer/components/catalog-request-button';
import { cn } from '@/shared/ui/cn';

type ApartmentInquireCardProps = {
  apartmentId: string;
  projectId: string;
  builderName: string;
  builderLogoUrl: string | null;
  matterportUrl: string | null;
  external3dUrl: string | null;
  className?: string | undefined;
};

/**
 * Sticky inquire panel — Figma apartment detail sidebar.
 */
export const ApartmentInquireCard = ({
  apartmentId,
  projectId,
  builderName,
  builderLogoUrl,
  matterportUrl,
  external3dUrl,
  className,
}: ApartmentInquireCardProps) => {
  const t = useTranslations('Catalog.apartment');

  return (
    <aside
      className={cn(
        'rounded-[20px] border border-header-border bg-surface-elevated p-6 shadow-sm',
        'lg:sticky lg:top-24',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-brand text-xl font-bold tracking-tight text-ink-navy">
            {t('inquireTitle')}
          </h2>
          <p className="mt-1 text-sm text-header-muted">{t('inquireSubtitle')}</p>
        </div>
        <ApartmentDetailFavorite apartmentId={apartmentId} />
      </div>

      <div className="mt-6">
        <CatalogRequestButton
          projectId={projectId}
          apartmentId={apartmentId}
          labelKey="requestInfo"
          className="w-full [&_a]:w-full [&_button]:h-11 [&_button]:w-full [&_button]:rounded-full [&_button]:bg-brand-deep [&_button]:hover:bg-brand-deep/90"
        />
      </div>

      <div className="mt-6 flex items-center gap-3 border-t border-header-border pt-5">
        {builderLogoUrl ? (
          <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-band-mist">
            <Image
              src={builderLogoUrl}
              alt={builderName}
              fill
              className="object-cover"
              sizes="44px"
            />
          </span>
        ) : (
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand-deep">
            {builderName.slice(0, 1).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-navy">{builderName}</p>
          <p className="text-xs text-header-muted">{t('inquireAgentRole')}</p>
        </div>
      </div>

      {matterportUrl || external3dUrl ? (
        <div className="mt-5 flex flex-col gap-2">
          {matterportUrl ? (
            <a
              href={matterportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-brand-deep hover:underline"
            >
              {t('matterportTour')}
            </a>
          ) : null}
          {external3dUrl ? (
            <a
              href={external3dUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-brand-deep hover:underline"
            >
              {t('external3dTour')}
            </a>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
};
