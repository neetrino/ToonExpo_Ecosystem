import type { BuilderDetail } from '@toonexpo/contracts';
import { getTranslations } from 'next-intl/server';

import {
  BuilderContactsCard,
  type BuilderContactLink,
} from '@/features/catalog/components/builder-contacts-card';
import { ProjectCard } from '@/features/catalog/components/project-card';
import { ProjectPriceRangesOverlayScope } from '@/features/catalog/components/price-overlay-scope';
import { CATALOG_CARD_CELL_FILL_CLASS } from '@/features/catalog/constants/catalog-list';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type BuilderDetailContentProps = {
  builder: BuilderDetail;
};

/**
 * Builder body — published projects + contacts (hero already shows name / address).
 */
export const BuilderDetailContent = async ({ builder }: BuilderDetailContentProps) => {
  const t = await getTranslations('Catalog');
  const catalogHref = `/projects?builderId=${encodeURIComponent(builder.id)}`;
  const links = buildBuilderContactLinks(builder, {
    website: t('buildersPage.detail.linkWebsite'),
    instagram: t('buildersPage.detail.linkInstagram'),
    facebook: t('buildersPage.detail.linkFacebook'),
    mediaMaterials: t('buildersPage.detail.linkMediaMaterials'),
    advertisingMaterials: t('buildersPage.detail.linkAdvertisingMaterials'),
  });

  return (
    <div className="page-container pb-16 pt-8 sm:pt-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-brand text-[clamp(1.75rem,1.4rem+1.2vw,2.5rem)] font-bold tracking-[-0.02em] text-ink-navy">
          {t('buildersPage.detail.projectsTitle')}
        </h2>
        <Link
          href={catalogHref}
          className={cn(
            'inline-flex h-11 shrink-0 items-center justify-center rounded-sm px-5 text-sm font-medium',
            'bg-brand text-on-brand transition-colors hover:bg-brand-hover',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
            'lg:hidden',
          )}
        >
          {t('buildersPage.detail.catalogLink')}
        </Link>
      </div>

      <div
        className={cn('grid gap-10', 'lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start xl:gap-14')}
      >
        {builder.projects.length === 0 ? (
          <p className="rounded-[20px] border border-dashed border-header-border bg-surface-elevated px-6 py-12 text-center text-sm text-header-muted">
            {t('buildersPage.detail.emptyProjects')}
          </p>
        ) : (
          <ProjectPriceRangesOverlayScope
            projectIds={builder.projects.map((project) => project.id)}
          >
            <div
              className={cn(
                'grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2',
                CATALOG_CARD_CELL_FILL_CLASS,
              )}
            >
              {builder.projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </ProjectPriceRangesOverlayScope>
        )}

        <BuilderContactsCard
          className="lg:sticky lg:top-24"
          phone={builder.phone}
          email={builder.email}
          contactPerson={builder.contactPerson}
          projectCount={builder.publishedProjectCount}
          catalogHref={catalogHref}
          links={links}
        />
      </div>
    </div>
  );
};

const buildBuilderContactLinks = (
  builder: BuilderDetail,
  labels: {
    website: string;
    instagram: string;
    facebook: string;
    mediaMaterials: string;
    advertisingMaterials: string;
  },
): BuilderContactLink[] => {
  const rows: Array<{ kind: BuilderContactLink['kind']; label: string; href: string | null }> = [
    { kind: 'website', label: labels.website, href: builder.websiteUrl },
    { kind: 'instagram', label: labels.instagram, href: builder.instagramUrl },
    { kind: 'facebook', label: labels.facebook, href: builder.facebookUrl },
    { kind: 'mediaMaterials', label: labels.mediaMaterials, href: builder.mediaMaterialsUrl },
    {
      kind: 'advertisingMaterials',
      label: labels.advertisingMaterials,
      href: builder.advertisingMaterialsUrl,
    },
  ];

  return rows
    .filter((row): row is { kind: BuilderContactLink['kind']; label: string; href: string } =>
      Boolean(row.href?.trim()),
    )
    .map((row) => ({ kind: row.kind, label: row.label, href: row.href.trim() }));
};
