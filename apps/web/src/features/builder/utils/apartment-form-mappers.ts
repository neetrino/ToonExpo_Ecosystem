import type { PortalApartmentDetail, UpdatePortalApartmentRequest } from '@toonexpo/contracts';

import type { UpdateApartmentFormValues } from '@/features/builder/schemas/apartment.schema';
import {
  mergeApartmentFeatureExtras,
  parseApartmentFeatureExtras,
} from '@/features/catalog/utils/apartment-features';
import {
  toNullableHttpsUrl,
} from '@/features/media/schemas/media-fields.schema';

const optionalNumber = (value: string): number | null => {
  if (value.trim().length === 0) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Maps portal apartment detail into edit-form default values.
 */
export const toApartmentFormValues = (
  apartment: PortalApartmentDetail,
): UpdateApartmentFormValues => {
  const extras = parseApartmentFeatureExtras(apartment.features);
  return {
    number: apartment.number,
    rooms: apartment.rooms?.toString() ?? '',
    bedrooms: apartment.bedrooms?.toString() ?? '',
    bathrooms: apartment.bathrooms?.toString() ?? '',
    areaTotal: apartment.areaTotal ?? '',
    areaLiving: apartment.areaLiving ?? '',
    balconyArea: apartment.balconyArea ?? '',
    price: apartment.price ?? '',
    priceVisibility: apartment.priceVisibility,
    salesStatus: apartment.salesStatus,
    descriptionHy: apartment.translations?.description?.hy ?? apartment.description ?? '',
    descriptionRu: apartment.translations?.description?.ru ?? '',
    descriptionEn: apartment.translations?.description?.en ?? '',
    finishingStatus: extras.finishingStatus ?? '',
    handoverDescription: extras.handoverDescription ?? '',
    matterportUrl: apartment.matterportUrl ?? '',
    external3dUrl: apartment.external3dUrl ?? '',
  };
};

/**
 * Builds the portal update payload from apartment edit-form values.
 */
export const toApartmentUpdateRequest = (
  values: UpdateApartmentFormValues,
  apartment: PortalApartmentDetail,
): UpdatePortalApartmentRequest => {
  const description = {
    ...(values.descriptionHy.length > 0 ? { hy: values.descriptionHy } : {}),
    ...(values.descriptionRu.length > 0 ? { ru: values.descriptionRu } : {}),
    ...(values.descriptionEn.length > 0 ? { en: values.descriptionEn } : {}),
  };
  return {
    number: values.number,
    rooms: optionalNumber(values.rooms),
    bedrooms: optionalNumber(values.bedrooms),
    bathrooms: optionalNumber(values.bathrooms),
    areaTotal: optionalNumber(values.areaTotal),
    areaLiving: optionalNumber(values.areaLiving),
    balconyArea: optionalNumber(values.balconyArea),
    price: optionalNumber(values.price),
    priceVisibility: values.priceVisibility,
    salesStatus: values.salesStatus,
    description: values.descriptionHy.length > 0 ? values.descriptionHy : null,
    ...(Object.keys(description).length > 0 ? { translations: { description } } : {}),
    features: mergeApartmentFeatureExtras(apartment.features, {
      finishingStatus: values.finishingStatus,
      handoverDescription: values.handoverDescription,
    }),
    matterportUrl: toNullableHttpsUrl(values.matterportUrl),
    external3dUrl: toNullableHttpsUrl(values.external3dUrl),
  };
};
