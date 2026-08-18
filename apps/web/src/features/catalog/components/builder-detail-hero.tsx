import type { BuilderDetail } from '@toonexpo/contracts';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import { resolveBuilderHeroAddress } from '@/features/catalog/utils/resolve-builder-hero-address';
import { resolvePublicAssetUrl } from '@/shared/lib/static-asset-url';
import { cn } from '@/shared/ui/cn';

const BUILDER_LOGO_SIZE_CLASS = 'size-14 sm:size-16';
const BUILDER_LOGO_IMAGE_SIZES = '64px';
/** Same inset as logo + `gap-5`, on both sides of the stats row. */
const STATS_SIDE_INSET_CLASS = 'px-[4.75rem] sm:px-[5.25rem]';

type BuilderDetailHeroProps = {
  builder: BuilderDetail;
};

type BuilderMarkProps = {
  name: string;
  logoUrl: string | null;
  initials: string;
};

const BuilderMark = ({ name, logoUrl, initials }: BuilderMarkProps) =>
  logoUrl ? (
    <span
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full bg-surface ring-1 ring-header-border',
        BUILDER_LOGO_SIZE_CLASS,
      )}
    >
      <Image src={logoUrl} alt={name} fill className="object-cover" sizes={BUILDER_LOGO_IMAGE_SIZES} />
    </span>
  ) : (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-brand-deep font-brand text-lg font-bold text-on-dark sm:text-xl',
        BUILDER_LOGO_SIZE_CLASS,
      )}
      aria-hidden
    >
      {initials}
    </span>
  );

type BuilderHeroSummaryProps = {
  name: string;
  eyebrow: string;
  description: string | null;
  logoUrl: string | null;
  initials: string;
};

const BuilderHeroSummary = ({
  name,
  eyebrow,
  description,
  logoUrl,
  initials,
}: BuilderHeroSummaryProps) => (
  <div className="flex items-start gap-5">
    <BuilderMark name={name} logoUrl={logoUrl} initials={initials} />
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-bold tracking-[0.2em] text-brand-secondary uppercase">{eyebrow}</p>
      <h1 className="mt-2 font-brand text-[clamp(2rem,5vw,3.75rem)] font-bold leading-[1.15] tracking-[-0.03em] text-ink-navy">
        {name}
      </h1>
      {description ? (
        <p className="mt-3 max-w-2xl text-lg leading-6 text-header-muted">{description}</p>
      ) : null}
    </div>
  </div>
);

type HeroStatProps = {
  label: string;
  value: string;
};

const HeroStat = ({ label, value }: HeroStatProps) => (
  <div>
    <dt className="text-[10px] font-bold tracking-widest text-header-muted uppercase">{label}</dt>
    <dd className="mt-1.5 font-brand text-xl font-bold leading-7 break-words text-ink-navy">
      {value}
    </dd>
  </div>
);

/**
 * Full-bleed cover + overlapping summary card — same chrome as project hero.
 */
export const BuilderDetailHero = async ({ builder }: BuilderDetailHeroProps) => {
  const t = await getTranslations('Catalog');
  const logoUrl = resolvePublicAssetUrl(builder.logoUrl);
  const heroImageUrl = resolvePublicAssetUrl(builder.coverUrl) ?? logoUrl;
  const initials = builder.name.trim().slice(0, 2).toUpperCase() || '—';
  const description = builder.description?.trim() || builder.shortDescription?.trim() || null;
  const region = builder.region?.trim() || null;
  const address = builder.address?.trim() || resolveBuilderHeroAddress(builder.projects);

  return (
    <section className="relative">
      <div className="relative h-[min(72vh,48rem)] w-full overflow-hidden bg-surface">
        {heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt={builder.name}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="size-full bg-band-mist" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-ink/20" />
      </div>

      <div className="page-container relative z-[1] -mt-40 pb-4 sm:-mt-48">
        <div
          className={cn(
            'rounded-[24px] bg-surface-elevated p-6 ring-1 ring-header-border sm:p-8',
            'shadow-lg shadow-brand/5',
          )}
        >
          <BuilderHeroSummary
            name={builder.name}
            eyebrow={t('buildersPage.detail.heroEyebrow')}
            description={description}
            logoUrl={logoUrl}
            initials={initials}
          />

          <dl className={cn('mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3', STATS_SIDE_INSET_CLASS)}>
            <HeroStat
              label={t('buildersPage.detail.projectCount')}
              value={String(builder.publishedProjectCount)}
            />
            {region ? <HeroStat label={t('buildersPage.detail.statRegion')} value={region} /> : null}
            {address ? <HeroStat label={t('buildersPage.detail.statAddress')} value={address} /> : null}
          </dl>
        </div>
      </div>
    </section>
  );
};
