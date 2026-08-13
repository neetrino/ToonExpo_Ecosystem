'use client';

import type { BuilderSummary } from '@toonexpo/contracts';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { resolvePublicAssetUrl, staticAssetUrl } from '@/shared/lib/static-asset-url';
import { cn } from '@/shared/ui/cn';

/** Fallback cover when a builder has no logo — matches partners card media presence. */
const BUILDER_CARD_FALLBACK_SRC = staticAssetUrl('/demo/building-a.webp');

type BuilderCardProps = {
  builder: BuilderSummary;
  className?: string | undefined;
};

/**
 * Builder card — same chrome as public partner cards.
 */
export const BuilderCard = ({ builder, className }: BuilderCardProps) => {
  const t = useTranslations('Catalog');
  const photoSrc = resolvePublicAssetUrl(builder.logoUrl) ?? BUILDER_CARD_FALLBACK_SRC;

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-[20px] bg-surface-elevated p-2',
        'ring-1 ring-header-border transition-all duration-[var(--duration-base)]',
        'hover:shadow-lg hover:shadow-brand/5 hover:ring-brand/40',
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[15px] bg-surface">
        <Link href={`/builders/${builder.id}`} className="absolute inset-0 block">
          <Image
            src={photoSrc}
            alt={builder.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col px-3 pt-4 pb-3">
        <div className="mb-1 flex items-start justify-between gap-3">
          <h3 className="min-w-0 truncate font-brand text-base font-semibold tracking-[-0.02em] text-ink-navy">
            <Link
              href={`/builders/${builder.id}`}
              className="transition-colors hover:text-brand-deep"
            >
              {builder.name}
            </Link>
          </h3>
          <p className="shrink-0 font-brand text-sm font-bold leading-7 text-brand-deep">
            {builder.publishedProjectCount}
          </p>
        </div>

        {builder.description ? (
          <p className="mb-4 line-clamp-2 text-xs leading-4 text-header-muted">
            {builder.description}
          </p>
        ) : (
          <p className="mb-4 text-xs leading-4 text-header-muted">
            {t('builders.projectCount', { count: builder.publishedProjectCount })}
          </p>
        )}

        <div
          className={cn(
            'mt-auto flex flex-wrap items-center gap-4 border-t border-header-border pt-3',
            'text-[11px] font-medium tracking-tight text-header-muted uppercase',
          )}
        >
          <span>{t('buildersPage.actions.details')}</span>
        </div>
      </div>
    </article>
  );
};
