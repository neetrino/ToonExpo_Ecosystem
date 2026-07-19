import type {
  CreatePortalApartmentRequest,
  CreatePortalProjectRequest,
  PortalTranslationsInput,
  UpdatePortalProjectRequest,
} from "@toonexpo/contracts";

import type { BulkApartmentsFormValues } from "@/features/builder/schemas/inventory.schema";
import type { CreateProjectFormValues } from "@/features/builder/schemas/project.schema";
import { toNullableMediaId } from "@/features/media/schemas/media-fields.schema";

const optionalText = (value: string): string | undefined =>
  value.length > 0 ? value : undefined;

const buildLocaleMap = (
  hy: string,
  ru: string,
  en: string,
): { hy?: string; ru?: string; en?: string } | undefined => {
  const map: { hy?: string; ru?: string; en?: string } = {};
  if (hy.length > 0) {
    map.hy = hy;
  }
  if (ru.length > 0) {
    map.ru = ru;
  }
  if (en.length > 0) {
    map.en = en;
  }
  return Object.keys(map).length > 0 ? map : undefined;
};

/**
 * Builds translation payload from form locale fields.
 */
export const buildProjectTranslations = (
  values: CreateProjectFormValues,
): PortalTranslationsInput | undefined => {
  const translations: PortalTranslationsInput = {};
  const name = buildLocaleMap(values.nameHy, values.nameRu, values.nameEn);
  const shortDescription = buildLocaleMap(
    values.shortDescriptionHy,
    values.shortDescriptionRu,
    values.shortDescriptionEn,
  );
  const fullDescription = buildLocaleMap(
    values.fullDescriptionHy,
    values.fullDescriptionRu,
    values.fullDescriptionEn,
  );
  const locationText = buildLocaleMap(
    values.locationTextHy,
    values.locationTextRu,
    values.locationTextEn,
  );

  if (name) {
    translations.name = name;
  }
  if (shortDescription) {
    translations.shortDescription = shortDescription;
  }
  if (fullDescription) {
    translations.fullDescription = fullDescription;
  }
  if (locationText) {
    translations.locationText = locationText;
  }

  return Object.keys(translations).length > 0 ? translations : undefined;
};

/**
 * Maps create-project form values to the API request body.
 */
export const toCreateProjectRequest = (
  values: CreateProjectFormValues,
): CreatePortalProjectRequest => {
  const translations = buildProjectTranslations(values);
  return {
    name: values.nameHy,
    ...(optionalText(values.slug) ? { slug: values.slug } : {}),
    ...(optionalText(values.shortDescriptionHy)
      ? { shortDescription: values.shortDescriptionHy }
      : {}),
    ...(optionalText(values.fullDescriptionHy)
      ? { fullDescription: values.fullDescriptionHy }
      : {}),
    ...(optionalText(values.locationTextHy)
      ? { locationText: values.locationTextHy }
      : {}),
    ...(optionalText(values.address) ? { address: values.address } : {}),
    ...(optionalText(values.city) ? { city: values.city } : {}),
    ...(optionalText(values.district) ? { district: values.district } : {}),
    ...(optionalText(values.projectType)
      ? { projectType: values.projectType }
      : {}),
    ...(optionalText(values.constructionStatus)
      ? { constructionStatus: values.constructionStatus }
      : {}),
    ...(optionalText(values.completionDate)
      ? { completionDate: values.completionDate }
      : {}),
    ...(optionalText(values.coverMediaId)
      ? { coverMediaId: values.coverMediaId }
      : {}),
    ...(translations ? { translations } : {}),
  };
};

/**
 * Maps update-project form values to the API request body.
 */
export const toUpdateProjectRequest = (
  values: CreateProjectFormValues,
): UpdatePortalProjectRequest => {
  const translations = buildProjectTranslations(values);
  const request: UpdatePortalProjectRequest = {
    name: values.nameHy,
    shortDescription: optionalText(values.shortDescriptionHy) ?? null,
    fullDescription: optionalText(values.fullDescriptionHy) ?? null,
    locationText: optionalText(values.locationTextHy) ?? null,
    address: optionalText(values.address) ?? null,
    city: optionalText(values.city) ?? null,
    district: optionalText(values.district) ?? null,
    projectType: optionalText(values.projectType) ?? null,
    constructionStatus: optionalText(values.constructionStatus) ?? null,
    completionDate: optionalText(values.completionDate) ?? null,
    coverMediaId: toNullableMediaId(values.coverMediaId),
  };

  const slug = optionalText(values.slug);
  if (slug) {
    request.slug = slug;
  }
  if (translations) {
    request.translations = translations;
  }

  return request;
};

const optionalNumber = (value: string): number | undefined => {
  if (value.length === 0) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

/**
 * Expands a bulk template into CreatePortalApartmentRequest rows.
 */
export const buildBulkApartments = (
  values: BulkApartmentsFormValues,
): CreatePortalApartmentRequest[] => {
  const count = Number(values.count);
  const startNumber = Number(values.startNumber);
  const rooms = optionalNumber(values.rooms);
  const bedrooms = optionalNumber(values.bedrooms);
  const bathrooms = optionalNumber(values.bathrooms);
  const areaTotal = optionalNumber(values.areaTotal);
  const price = optionalNumber(values.price);

  return Array.from({ length: count }, (_, index) => {
    const number = `${values.numberPrefix}${startNumber + index}`;
    return {
      number,
      ...(rooms !== undefined ? { rooms } : {}),
      ...(bedrooms !== undefined ? { bedrooms } : {}),
      ...(bathrooms !== undefined ? { bathrooms } : {}),
      ...(areaTotal !== undefined ? { areaTotal } : {}),
      ...(price !== undefined ? { price } : {}),
    };
  });
};
