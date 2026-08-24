import type { ProjectBankPartnerOfferSummary } from '@toonexpo/contracts';

import {
  ProjectCatalogCheckList,
  ProjectCatalogDetailsList,
  ProjectCatalogOverviewStat,
} from '@/features/catalog/components/project-catalog-details-bits';
import { ProjectBankPartnerOffersPanel } from '@/features/catalog/components/project-bank-partner-offers-panel';
import { ProjectCatalogSectionCard } from '@/features/catalog/components/project-catalog-section-card';
import { ProjectCatalogLinksSection } from '@/features/catalog/components/project-catalog-links-section';
import { ProjectCatalogMediaPoster } from '@/features/catalog/components/project-catalog-media-poster';
import { ProjectCatalogGeoMap } from '@/features/catalog/components/project-catalog-geo-map';
import { ProjectCatalogVideoSection } from '@/features/catalog/components/project-catalog-video-section';
import {
  splitProjectCatalogRowsBySection,
  type ProjectCatalogRow,
} from '@/features/catalog/utils/build-project-catalog-rows';
import type { ProjectCatalogLink } from '@/features/catalog/utils/project-catalog-details';
import { splitProjectCatalogLinks } from '@/features/catalog/utils/project-catalog-links';
import type { buildProjectBankPartnerOfferRows } from '@/features/catalog/utils/build-project-bank-partner-offer-rows';
import { staticAssetUrl } from '@/shared/lib/static-asset-url';
import { cn } from '@/shared/ui/cn';

type ProjectCatalogDetailsPanelProps = {
  projectId: string;
  title: string;
  aboutTitle: string;
  aboutText: string | null;
  overviewTitle: string;
  detailsTitle: string;
  financeTitle: string;
  bankPartnerTitle: string;
  amenitiesTitle: string;
  nearbyTitle: string;
  linksTitle: string;
  socialsTitle: string;
  videoTitle: string;
  videoOpenLabel: string;
  linkLabels: Record<ProjectCatalogLink['id'], string>;
  bankPartnerFieldLabels: Parameters<typeof buildProjectBankPartnerOfferRows>[2];
  bankPartnerOffers: ProjectBankPartnerOfferSummary[];
  locale: string;
  rows: ProjectCatalogRow[];
  amenityLabels: string[];
  nearbyPlaces: string[];
  links: ProjectCatalogLink[];
};

/** Prefer compact icon stats in Overview; long text stays in Details. */
const OVERVIEW_MAX_ITEMS = 6;
const TYPICAL_TOUR_POSTER_SRC = staticAssetUrl('/images/project-floor-axonometric.webp');
const EXTERIOR_TOUR_POSTER_SRC = staticAssetUrl('/images/hero-variant-a.webp');
const MATTERPORT_TOUR_POSTER_SRC = staticAssetUrl('/images/project-floor-axonometric.webp');
const EXTERNAL_3D_TOUR_POSTER_SRC = staticAssetUrl('/images/hero-variant-a.webp');

/**
 * Project catalog — Houzez-style stacked white cards (Description / Overview /
 * Details / Finance / Bank partner / Features / Nearby / Video / Tours / Map / Links / Socials).
 */
export const ProjectCatalogDetailsPanel = ({
  projectId,
  title,
  aboutTitle,
  aboutText,
  overviewTitle,
  detailsTitle,
  financeTitle,
  bankPartnerTitle,
  amenitiesTitle,
  nearbyTitle,
  linksTitle,
  socialsTitle,
  videoTitle,
  videoOpenLabel,
  linkLabels,
  bankPartnerFieldLabels,
  bankPartnerOffers,
  locale,
  rows,
  amenityLabels,
  nearbyPlaces,
  links,
}: ProjectCatalogDetailsPanelProps) => {
  const {
    general: generalRows,
    finance: financeRows,
    bankPartner: bankPartnerRows,
  } = splitProjectCatalogRowsBySection(rows);
  const overviewRows = generalRows.filter((row) => !row.wide).slice(0, OVERVIEW_MAX_ITEMS);
  const overviewIds = new Set(overviewRows.map((row) => row.id));
  const detailRows =
    overviewRows.length > 0
      ? generalRows.filter((row) => row.wide || !overviewIds.has(row.id))
      : generalRows;
  const {
    media: mediaLinks,
    social: socialLinks,
    video: videoLink,
    typicalTour: typicalTourLink,
    exteriorTour: exteriorTourLink,
    matterport: matterportLink,
    external3d: external3dLink,
  } = splitProjectCatalogLinks(links);
  const hasAbout = aboutText != null && aboutText.trim().length > 0;
  const hasOverview = overviewRows.length > 0;
  const hasDetails = detailRows.length > 0;
  const hasFinance = financeRows.length > 0;
  const hasRelationalBankPartnerOffers = bankPartnerOffers.length > 0;
  const hasLegacyBankPartner = !hasRelationalBankPartnerOffers && bankPartnerRows.length > 0;
  const hasAmenities = amenityLabels.length > 0;
  const hasNearby = nearbyPlaces.length > 0;
  const hasVideo = videoLink != null;
  const hasTypicalTour = typicalTourLink != null;
  const hasExteriorTour = exteriorTourLink != null;
  const hasMatterport = matterportLink != null;
  const hasExternal3d = external3dLink != null;
  const hasMediaLinks = mediaLinks.length > 0;
  const hasSocialLinks = socialLinks.length > 0;

  return (
    <section className="page-container py-12 sm:py-16">
      <h2 className="font-brand text-3xl font-bold tracking-tight text-ink-navy sm:text-4xl">
        {title}
      </h2>

      <div className="mt-8 space-y-5 sm:space-y-6">
        {hasAbout ? (
          <ProjectCatalogSectionCard title={aboutTitle}>
            <p className="max-w-3xl whitespace-pre-line text-[15px] leading-7 text-ink-secondary">
              {aboutText}
            </p>
          </ProjectCatalogSectionCard>
        ) : null}

        {hasOverview ? (
          <ProjectCatalogSectionCard title={overviewTitle}>
            <dl
              className={cn(
                'grid gap-6',
                overviewRows.length <= 3 && 'grid-cols-2 sm:grid-cols-3',
                overviewRows.length === 4 && 'grid-cols-2 sm:grid-cols-4',
                overviewRows.length >= 5 && 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
              )}
            >
              {overviewRows.map((row) => (
                <ProjectCatalogOverviewStat key={row.id} row={row} />
              ))}
            </dl>
          </ProjectCatalogSectionCard>
        ) : null}

        {hasDetails ? (
          <ProjectCatalogSectionCard title={detailsTitle}>
            <ProjectCatalogDetailsList rows={detailRows} />
          </ProjectCatalogSectionCard>
        ) : null}

        {hasFinance ? (
          <ProjectCatalogSectionCard title={financeTitle}>
            <ProjectCatalogDetailsList rows={financeRows} />
          </ProjectCatalogSectionCard>
        ) : null}

        {hasLegacyBankPartner ? (
          <ProjectCatalogSectionCard title={bankPartnerTitle}>
            <ProjectCatalogDetailsList rows={bankPartnerRows} />
          </ProjectCatalogSectionCard>
        ) : null}

        {hasRelationalBankPartnerOffers ? (
          <ProjectBankPartnerOffersPanel
            offers={bankPartnerOffers}
            locale={locale}
            sectionTitle={bankPartnerTitle}
            labels={bankPartnerFieldLabels}
          />
        ) : null}

        {hasAmenities ? (
          <ProjectCatalogSectionCard title={amenitiesTitle}>
            <ProjectCatalogCheckList items={amenityLabels} columns={4} />
          </ProjectCatalogSectionCard>
        ) : null}

        {hasNearby ? (
          <ProjectCatalogSectionCard title={nearbyTitle}>
            <ProjectCatalogCheckList items={nearbyPlaces} />
          </ProjectCatalogSectionCard>
        ) : null}

        {hasVideo && videoLink ? (
          <ProjectCatalogSectionCard title={videoTitle}>
            <ProjectCatalogVideoSection
              url={videoLink.url}
              title={videoTitle}
              openLabel={videoOpenLabel}
            />
          </ProjectCatalogSectionCard>
        ) : null}

        {hasTypicalTour && typicalTourLink ? (
          <ProjectCatalogSectionCard title={linkLabels.typicalInteractiveTour}>
            <ProjectCatalogMediaPoster
              title={linkLabels.typicalInteractiveTour}
              imageSrc={TYPICAL_TOUR_POSTER_SRC}
              href={typicalTourLink.url}
            />
          </ProjectCatalogSectionCard>
        ) : null}

        {hasExteriorTour && exteriorTourLink ? (
          <ProjectCatalogSectionCard title={linkLabels.exteriorInteractiveTour}>
            <ProjectCatalogMediaPoster
              title={linkLabels.exteriorInteractiveTour}
              imageSrc={EXTERIOR_TOUR_POSTER_SRC}
              href={exteriorTourLink.url}
            />
          </ProjectCatalogSectionCard>
        ) : null}

        {hasMatterport && matterportLink ? (
          <ProjectCatalogSectionCard title={linkLabels.matterport}>
            <ProjectCatalogMediaPoster
              title={linkLabels.matterport}
              imageSrc={MATTERPORT_TOUR_POSTER_SRC}
              href={matterportLink.url}
            />
          </ProjectCatalogSectionCard>
        ) : null}

        {hasExternal3d && external3dLink ? (
          <ProjectCatalogSectionCard title={linkLabels.external3d}>
            <ProjectCatalogMediaPoster
              title={linkLabels.external3d}
              imageSrc={EXTERNAL_3D_TOUR_POSTER_SRC}
              href={external3dLink.url}
            />
          </ProjectCatalogSectionCard>
        ) : null}

        <ProjectCatalogSectionCard title={linkLabels.map}>
          <ProjectCatalogGeoMap projectId={projectId} />
        </ProjectCatalogSectionCard>

        {hasMediaLinks ? (
          <ProjectCatalogSectionCard title={linksTitle}>
            <ProjectCatalogLinksSection links={mediaLinks} labels={linkLabels} />
          </ProjectCatalogSectionCard>
        ) : null}

        {hasSocialLinks ? (
          <ProjectCatalogSectionCard title={socialsTitle}>
            <ProjectCatalogLinksSection links={socialLinks} labels={linkLabels} />
          </ProjectCatalogSectionCard>
        ) : null}
      </div>
    </section>
  );
};
