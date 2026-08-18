'use client';

import type { BuilderSummary } from '@toonexpo/contracts';
import { Building2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { CATALOG_CARD_DESCRIPTION_CLASS } from '@/features/catalog/constants/catalog-list';
import { Link } from '@/i18n/navigation';
import { resolvePublicAssetUrl } from '@/shared/lib/static-asset-url';
import { cn } from '@/shared/ui/cn';

type BuilderCardProps = {
  builder: BuilderSummary;
  className?: string | undefined;
};

type BuilderCardCoverProps = {
  coverUrl: string | null;
  name: string;
  href: string;
};

const BuilderCardCover = ({ coverUrl, name, href }: BuilderCardCoverProps) => (
  <div className="relative aspect-[4/3] overflow-hidden rounded-[15px] bg-surface">
    <Link href={href} className="absolute inset-0 block">
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={name}
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <span className="flex size-full flex-col items-center justify-center gap-1.5 text-ink-muted">
          <Building2 className="size-8 opacity-40" aria-hidden />
          <span className="max-w-[80%] truncate text-xs">{name}</span>
        </span>
      )}
    </Link>
  </div>
);

/**
 * Builder card — same chrome as public partner cards.
 */
export const BuilderCard = ({ builder, className }: BuilderCardProps) => {
  const t = useTranslations('Catalog');
  const coverUrl =
    resolvePublicAssetUrl(builder.coverUrl) ?? resolvePublicAssetUrl(builder.logoUrl);

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-[20px] bg-surface-elevated p-2',
        'ring-1 ring-header-border transition-all duration-[var(--duration-base)]',
        'hover:shadow-lg hover:shadow-brand/5 hover:ring-brand/40',
        className,
      )}
    >
      <BuilderCardCover
        coverUrl={coverUrl}
        name={builder.name}
        href={`/builders/${builder.id}`}
      />

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

        <p className={CATALOG_CARD_DESCRIPTION_CLASS}>{builder.shortDescription}</p>

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
