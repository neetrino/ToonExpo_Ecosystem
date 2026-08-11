import type { ProjectCatalogDetails } from '@/features/catalog/utils/project-catalog-details';
import { PROJECT_CATALOG_DETAIL_KEYS } from '@/features/catalog/utils/project-catalog-details';
import type { ProjectCatalogLinkId } from '@/features/catalog/utils/project-catalog-links';
import { PROJECT_CATALOG_LINK_IDS } from '@/features/catalog/utils/project-catalog-links';

import type { TRANSLATION_LOCALES } from '@/features/builder/constants';
import { PROJECT_CATALOG_LIST_MAX_ITEMS } from '@/features/builder/constants/project-catalog-editor';

export type CatalogLocaleText = {
  hy: string;
  ru: string;
  en: string;
};

export type ProjectCatalogFormSlice = {
  catalogDetails: Record<keyof ProjectCatalogDetails, CatalogLocaleText>;
  amenityLabelsHy: string;
  amenityLabelsRu: string;
  amenityLabelsEn: string;
  nearbyPlacesHy: string;
  nearbyPlacesRu: string;
  nearbyPlacesEn: string;
  catalogLinks: Record<ProjectCatalogLinkId, string>;
};

const emptyLocaleText = (): CatalogLocaleText => ({ hy: '', ru: '', en: '' });

const asTrimmedString = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
};

/**
 * Reads a catalog value that may be a plain string (hy-canonical) or `{ hy, ru, en }`.
 */
export const readCatalogLocaleText = (value: unknown): CatalogLocaleText => {
  const plain = asTrimmedString(value);
  if (plain.length > 0) {
    return { hy: plain, ru: '', en: '' };
  }

  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return emptyLocaleText();
  }

  const record = value as Record<string, unknown>;
  return {
    hy: asTrimmedString(record['hy']),
    ru: asTrimmedString(record['ru']),
    en: asTrimmedString(record['en']),
  };
};

const writeCatalogLocaleText = (
  value: CatalogLocaleText,
): { hy?: string; ru?: string; en?: string } | undefined => {
  const map: { hy?: string; ru?: string; en?: string } = {};
  if (value.hy.trim().length > 0) {
    map.hy = value.hy.trim();
  }
  if (value.ru.trim().length > 0) {
    map.ru = value.ru.trim();
  }
  if (value.en.trim().length > 0) {
    map.en = value.en.trim();
  }
  return Object.keys(map).length > 0 ? map : undefined;
};

const linesToList = (value: string): string[] =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, PROJECT_CATALOG_LIST_MAX_ITEMS);

const listToLines = (items: string[]): string => items.join('\n');

const readLocaleStringList = (
  value: unknown,
  locale: (typeof TRANSLATION_LOCALES)[number],
): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') {
          return locale === 'hy' ? item.trim() : '';
        }
        if (item != null && typeof item === 'object' && !Array.isArray(item)) {
          return asTrimmedString((item as Record<string, unknown>)[locale]);
        }
        return '';
      })
      .filter((item) => item.length > 0);
  }

  if (value != null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const localeList = record[locale];
    if (Array.isArray(localeList)) {
      return localeList.map((item) => asTrimmedString(item)).filter((item) => item.length > 0);
    }
  }

  return [];
};

const emptyCatalogDetails = (): Record<keyof ProjectCatalogDetails, CatalogLocaleText> => {
  const details = {} as Record<keyof ProjectCatalogDetails, CatalogLocaleText>;
  for (const key of PROJECT_CATALOG_DETAIL_KEYS) {
    details[key] = emptyLocaleText();
  }
  return details;
};

const emptyCatalogLinks = (): Record<ProjectCatalogLinkId, string> => {
  const links = {} as Record<ProjectCatalogLinkId, string>;
  for (const id of PROJECT_CATALOG_LINK_IDS) {
    links[id] = '';
  }
  return links;
};

/**
 * Empty catalog slice for create forms / missing JSON.
 */
export const emptyProjectCatalogFormSlice = (): ProjectCatalogFormSlice => ({
  catalogDetails: emptyCatalogDetails(),
  amenityLabelsHy: '',
  amenityLabelsRu: '',
  amenityLabelsEn: '',
  nearbyPlacesHy: '',
  nearbyPlacesRu: '',
  nearbyPlacesEn: '',
  catalogLinks: emptyCatalogLinks(),
});

/**
 * Prefills Admin catalog fields from `Project.amenities` / `nearbyPlaces` JSON.
 */
export const catalogJsonToFormSlice = (
  amenities: unknown,
  nearbyPlaces: unknown,
): ProjectCatalogFormSlice => {
  const slice = emptyProjectCatalogFormSlice();

  if (amenities != null && typeof amenities === 'object' && !Array.isArray(amenities)) {
    const record = amenities as Record<string, unknown>;
    const detailsValue = record['details'];
    const detailsSource =
      detailsValue != null && typeof detailsValue === 'object' && !Array.isArray(detailsValue)
        ? (detailsValue as Record<string, unknown>)
        : record;

    for (const key of PROJECT_CATALOG_DETAIL_KEYS) {
      slice.catalogDetails[key] = readCatalogLocaleText(detailsSource[key]);
    }

    const labelsSource = record['labels'] ?? record['items'] ?? record['amenities'];
    slice.amenityLabelsHy = listToLines(readLocaleStringList(labelsSource, 'hy'));
    slice.amenityLabelsRu = listToLines(readLocaleStringList(labelsSource, 'ru'));
    slice.amenityLabelsEn = listToLines(readLocaleStringList(labelsSource, 'en'));

    const linksValue = record['links'];
    if (linksValue != null && typeof linksValue === 'object' && !Array.isArray(linksValue)) {
      const linksRecord = linksValue as Record<string, unknown>;
      for (const id of PROJECT_CATALOG_LINK_IDS) {
        slice.catalogLinks[id] = asTrimmedString(linksRecord[id]);
      }
    }
  } else if (Array.isArray(amenities)) {
    slice.amenityLabelsHy = listToLines(readLocaleStringList(amenities, 'hy'));
  }

  if (nearbyPlaces != null && typeof nearbyPlaces === 'object' && !Array.isArray(nearbyPlaces)) {
    const record = nearbyPlaces as Record<string, unknown>;
    const placesSource = record['places'] ?? record['items'] ?? record['nearby'];
    slice.nearbyPlacesHy = listToLines(readLocaleStringList(placesSource, 'hy'));
    slice.nearbyPlacesRu = listToLines(readLocaleStringList(placesSource, 'ru'));
    slice.nearbyPlacesEn = listToLines(readLocaleStringList(placesSource, 'en'));
  } else if (Array.isArray(nearbyPlaces)) {
    slice.nearbyPlacesHy = listToLines(readLocaleStringList(nearbyPlaces, 'hy'));
  }

  return slice;
};

const buildLocaleListMap = (
  hy: string,
  ru: string,
  en: string,
): { hy?: string[]; ru?: string[]; en?: string[] } | undefined => {
  const map: { hy?: string[]; ru?: string[]; en?: string[] } = {};
  const hyList = linesToList(hy);
  const ruList = linesToList(ru);
  const enList = linesToList(en);
  if (hyList.length > 0) {
    map.hy = hyList;
  }
  if (ruList.length > 0) {
    map.ru = ruList;
  }
  if (enList.length > 0) {
    map.en = enList;
  }
  return Object.keys(map).length > 0 ? map : undefined;
};

/**
 * Serializes Admin catalog fields into API `amenities` / `nearbyPlaces` JSON.
 */
export const catalogFormSliceToJson = (
  slice: ProjectCatalogFormSlice,
): { amenities: Record<string, unknown> | null; nearbyPlaces: Record<string, unknown> | null } => {
  const details: Record<string, unknown> = {};
  for (const key of PROJECT_CATALOG_DETAIL_KEYS) {
    const written = writeCatalogLocaleText(slice.catalogDetails[key]);
    if (written) {
      details[key] = written;
    }
  }

  const labels = buildLocaleListMap(
    slice.amenityLabelsHy,
    slice.amenityLabelsRu,
    slice.amenityLabelsEn,
  );

  const links: Record<string, string> = {};
  for (const id of PROJECT_CATALOG_LINK_IDS) {
    const url = slice.catalogLinks[id].trim();
    if (url.length > 0) {
      links[id] = url;
    }
  }

  const amenities: Record<string, unknown> = {};
  if (Object.keys(details).length > 0) {
    amenities['details'] = details;
  }
  if (labels) {
    amenities['labels'] = labels;
  }
  if (Object.keys(links).length > 0) {
    amenities['links'] = links;
  }

  const places = buildLocaleListMap(
    slice.nearbyPlacesHy,
    slice.nearbyPlacesRu,
    slice.nearbyPlacesEn,
  );
  const nearbyPlaces = places ? { places } : null;

  return {
    amenities: Object.keys(amenities).length > 0 ? amenities : null,
    nearbyPlaces,
  };
};
