'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

import type { DeveloperProfile } from '@/features/catalog/data/developer-profiles';
import { Link } from '@/i18n/navigation';
import { staticAssetUrl } from '@/shared/lib/static-asset-url';
import { cn } from '@/shared/ui/cn';

const DEVELOPER_CARD_FALLBACK_SRC = staticAssetUrl('/demo/building-a.webp');

type DeveloperListCardProps = {
  profile: DeveloperProfile;
  className?: string | undefined;
};

/**
 * Developer profile card on /builders — same chrome as partner cards.
 */
export const DeveloperListCard = ({ profile, className }: DeveloperListCardProps) => {
  const t = useTranslations('Catalog');
  const photoSrc = profile.logoUrl ?? DEVELOPER_CARD_FALLBACK_SRC;
  const href = `/developers/${profile.slug}` as const;

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
        <Link href={href} className="absolute inset-0 block">
          <Image
            src={photoSrc}
            alt={profile.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col px-3 pt-4 pb-3">
        <div className="mb-1 flex items-start justify-between gap-3">
          <h3 className="min-w-0 truncate font-brand text-base font-semibold tracking-[-0.02em] text-ink-navy">
            <Link href={href} className="transition-colors hover:text-brand-deep">
              {profile.name}
            </Link>
          </h3>
          <p className="shrink-0 font-brand text-sm font-bold leading-7 text-brand-deep">
            {profile.projectCount}
          </p>
        </div>

        <p className="mb-4 line-clamp-2 text-xs leading-4 text-header-muted">
          {profile.region}
          {' · '}
          {profile.address}
        </p>

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
