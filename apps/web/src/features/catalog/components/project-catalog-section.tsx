import type { ProjectDetail } from '@toonexpo/contracts';
import { getLocale, getTranslations } from 'next-intl/server';

import { ProjectCatalogDetailsPanel } from '@/features/catalog/components/project-catalog-details-panel';
import { buildProjectCatalogRows } from '@/features/catalog/utils/build-project-catalog-rows';
import { parseProjectCatalog } from '@/features/catalog/utils/project-catalog-details';

type ProjectCatalogSectionProps = {
  project: ProjectDetail;
};

/**
 * Server section that parses catalog JSON and renders the project facts panel.
 */
export const ProjectCatalogSection = async ({ project }: ProjectCatalogSectionProps) => {
  const locale = await getLocale();
  const t = await getTranslations('Catalog.projectDetail');
  const catalog = parseProjectCatalog(project.amenities, project.nearbyPlaces, locale);
  // Prefer localized catalog JSON only — do not fall back to English DB fields
  // (city/address/status enums) that would break hy/ru pages.
  const details = { ...catalog.details };

  const rows = buildProjectCatalogRows({
    details,
    labels: {
      slogan: t('catalog.slogan'),
      propertyType: t('catalog.propertyType'),
      country: t('catalog.country'),
      city: t('catalog.city'),
      address: t('catalog.address'),
      zipCode: t('catalog.zipCode'),
      brandName: t('catalog.brandName'),
      designer: t('catalog.designer'),
      contractor: t('catalog.contractor'),
      permitNumber: t('catalog.permitNumber'),
      constructionStart: t('catalog.constructionStart'),
      constructionEnd: t('catalog.constructionEnd'),
      constructionStatus: t('catalog.constructionStatus'),
      partnerBank: t('catalog.partnerBank'),
      bedroomsCount: t('catalog.bedroomsCount'),
      pricePerSqm: t('catalog.pricePerSqm'),
      areaRange: t('catalog.areaRange'),
      unitPriceRange: t('catalog.unitPriceRange'),
      parkingPrice: t('catalog.parkingPrice'),
      managementFee: t('catalog.managementFee'),
      parkingAvailable: t('catalog.parkingAvailable'),
      storageAvailable: t('catalog.storageAvailable'),
      elevator: t('catalog.elevator'),
      elevatorsCount: t('catalog.elevatorsCount'),
      constructionType: t('catalog.constructionType'),
      facadeMaterials: t('catalog.facadeMaterials'),
      thermalSoundInsulation: t('catalog.thermalSoundInsulation'),
      seismicStandard: t('catalog.seismicStandard'),
      totalLandArea: t('catalog.totalLandArea'),
      totalResidentialArea: t('catalog.totalResidentialArea'),
      buildingsCount: t('catalog.buildingsCount'),
      apartmentsCount: t('catalog.apartmentsCount'),
      availableApartmentsCount: t('catalog.availableApartmentsCount'),
      parkingSpaces: t('catalog.parkingSpaces'),
      openParkingSpaces: t('catalog.openParkingSpaces'),
      closedParkingSpaces: t('catalog.closedParkingSpaces'),
      parkingStandardSizes: t('catalog.parkingStandardSizes'),
      ceilingHeight: t('catalog.ceilingHeight'),
      floorsCount: t('catalog.floorsCount'),
      heating: t('catalog.heating'),
      cooling: t('catalog.cooling'),
      hotWater: t('catalog.hotWater'),
      gas: t('catalog.gas'),
      schoolDistance: t('catalog.schoolDistance'),
      kindergartenDistance: t('catalog.kindergartenDistance'),
      commercialAreaSqm: t('catalog.commercialAreaSqm'),
      distanceExtra: t('catalog.distanceExtra'),
      economicZone: t('catalog.economicZone'),
      subsidizedPrograms: t('catalog.subsidizedPrograms'),
      finishingStatus: t('catalog.finishingStatus'),
      services: t('catalog.services'),
      paymentTypes: t('catalog.paymentTypes'),
      installmentTerms: t('catalog.installmentTerms'),
      mortgageTerms: t('catalog.mortgageTerms'),
      specialTermsAvailable: t('catalog.specialTermsAvailable'),
      specialTerms: t('catalog.specialTerms'),
      incomeTaxRefund: t('catalog.incomeTaxRefund'),
      handoverDescription: t('catalog.handoverDescription'),
      greenZones: t('catalog.greenZones'),
      territorialAdvantages: t('catalog.territorialAdvantages'),
      views: t('catalog.views'),
    },
    formatCeilingHeight: (height) => t('catalog.ceilingHeightValue', { height }),
    formatDistanceMeters: (distance) => {
      const numeric = distance.replace(/\s*(m|м|մ)\s*$/iu, '').trim();
      return t('catalog.distanceMetersValue', { distance: numeric || distance });
    },
    formatRange: (min, max) => {
      if (min != null && max != null) {
        return t('catalog.rangeValue', { min, max });
      }
      return min ?? max;
    },
  });

  return (
    <ProjectCatalogDetailsPanel
      title={t('catalog.title')}
      aboutTitle={t('catalog.about')}
      aboutText={project.fullDescription}
      overviewTitle={t('catalog.overview')}
      detailsTitle={t('catalog.details')}
      financeTitle={t('catalog.finance')}
      amenitiesTitle={t('catalog.amenities')}
      nearbyTitle={t('catalog.nearby')}
      linksTitle={t('catalog.links')}
      socialsTitle={t('catalog.socials')}
      videoTitle={t('catalog.video')}
      videoOpenLabel={t('catalog.videoOpen')}
      linkLabels={{
        exteriorRenders: t('catalog.linkExteriorRenders'),
        interiorRenders: t('catalog.linkInteriorRenders'),
        typicalInteractiveTour: t('catalog.linkTypicalInteractiveTour'),
        video: t('catalog.linkVideo'),
        exteriorInteractiveTour: t('catalog.linkExteriorInteractiveTour'),
        matterport: t('catalog.linkMatterport'),
        external3d: t('catalog.linkExternal3d'),
        floorplans2d: t('catalog.linkFloorplans2d'),
        floorplans3d: t('catalog.linkFloorplans3d'),
        branding: t('catalog.linkBranding'),
        map: t('catalog.linkMap'),
        website: t('catalog.linkWebsite'),
        facebook: t('catalog.linkFacebook'),
        instagram: t('catalog.linkInstagram'),
      }}
      rows={rows}
      amenityLabels={catalog.amenityLabels}
      nearbyPlaces={catalog.nearbyPlaces}
      links={catalog.links}
    />
  );
};
