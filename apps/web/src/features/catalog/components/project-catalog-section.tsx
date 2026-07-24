import type { ProjectDetail } from '@toonexpo/contracts';
import { getTranslations } from 'next-intl/server';

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
  const t = await getTranslations('Catalog.projectDetail');
  const catalog = parseProjectCatalog(project.amenities, project.nearbyPlaces);
  const details = {
    ...catalog.details,
    propertyType: catalog.details.propertyType ?? project.projectType,
    city: catalog.details.city ?? project.city,
    address: catalog.details.address ?? project.address ?? project.locationText,
    constructionStatus: catalog.details.constructionStatus ?? project.constructionStatus,
  };

  const rows = buildProjectCatalogRows({
    details,
    labels: {
      propertyType: t('catalog.propertyType'),
      country: t('catalog.country'),
      city: t('catalog.city'),
      address: t('catalog.address'),
      brandName: t('catalog.brandName'),
      permitNumber: t('catalog.permitNumber'),
      constructionStart: t('catalog.constructionStart'),
      constructionEnd: t('catalog.constructionEnd'),
      constructionStatus: t('catalog.constructionStatus'),
      partnerBank: t('catalog.partnerBank'),
      pricePerSqm: t('catalog.pricePerSqm'),
      areaRange: t('catalog.areaRange'),
      unitPriceRange: t('catalog.unitPriceRange'),
      managementFee: t('catalog.managementFee'),
      parkingAvailable: t('catalog.parkingAvailable'),
      storageAvailable: t('catalog.storageAvailable'),
      elevator: t('catalog.elevator'),
      constructionType: t('catalog.constructionType'),
      facadeMaterials: t('catalog.facadeMaterials'),
      seismicStandard: t('catalog.seismicStandard'),
      buildingsCount: t('catalog.buildingsCount'),
      apartmentsCount: t('catalog.apartmentsCount'),
      parkingSpaces: t('catalog.parkingSpaces'),
      ceilingHeight: t('catalog.ceilingHeight'),
      floorsCount: t('catalog.floorsCount'),
      heating: t('catalog.heating'),
      hotWater: t('catalog.hotWater'),
      gas: t('catalog.gas'),
      schoolDistance: t('catalog.schoolDistance'),
      kindergartenDistance: t('catalog.kindergartenDistance'),
      commercialAreaSqm: t('catalog.commercialAreaSqm'),
      distanceExtra: t('catalog.distanceExtra'),
      economicZone: t('catalog.economicZone'),
      finishingStatus: t('catalog.finishingStatus'),
      services: t('catalog.services'),
      paymentTypes: t('catalog.paymentTypes'),
      installmentTerms: t('catalog.installmentTerms'),
      mortgageTerms: t('catalog.mortgageTerms'),
      specialTerms: t('catalog.specialTerms'),
      handoverDescription: t('catalog.handoverDescription'),
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
      subtitle={t('catalog.subtitle')}
      aboutTitle={t('catalog.about')}
      aboutText={project.fullDescription}
      factsTitle={t('catalog.facts')}
      amenitiesTitle={t('catalog.amenities')}
      nearbyTitle={t('catalog.nearby')}
      rows={rows}
      amenityLabels={catalog.amenityLabels}
      nearbyPlaces={catalog.nearbyPlaces}
    />
  );
};
