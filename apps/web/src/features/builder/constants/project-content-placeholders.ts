import type { ProjectCatalogDetails } from '@/features/catalog/utils/project-catalog-details';

import { TRANSLATION_LOCALES } from '@/features/builder/constants';

export type ContentLocale = (typeof TRANSLATION_LOCALES)[number];

type ProjectFormPlaceholderKey =
  | 'name'
  | 'slug'
  | 'shortDescription'
  | 'fullDescription'
  | 'locationText'
  | 'address'
  | 'city'
  | 'district'
  | 'projectType'
  | 'constructionStatus';

type CatalogPlaceholderKey = keyof ProjectCatalogDetails;

const isContentLocale = (value: string): value is ContentLocale =>
  (TRANSLATION_LOCALES as readonly string[]).includes(value);

/** Resolves HY/RU/EN content-tab locale (falls back to English). */
export const resolveContentLocale = (value: string): ContentLocale =>
  isContentLocale(value) ? value : 'en';

const PROJECT_FORM_PLACEHOLDERS: Record<
  ContentLocale,
  Record<ProjectFormPlaceholderKey, string>
> = {
  en: {
    name: 'e.g. Saralanj View',
    slug: 'e.g. saralanj-view',
    shortDescription: 'Modern residences with panoramic city views…',
    fullDescription:
      'A residential complex in Arabkir with green courtyards, underground parking, and apartments from 45 to 120 m²…',
    locationText: 'e.g. Arabkir, Yerevan',
    address: 'e.g. 12 Komitas Ave',
    city: 'e.g. Yerevan',
    district: 'e.g. Arabkir',
    projectType: 'e.g. Residential complex',
    constructionStatus: 'e.g. Under construction',
  },
  hy: {
    name: 'օր. Սարալանջ Վյու',
    slug: 'օր. saralanj-view',
    shortDescription: 'Ժամանակակից բնակարաններ՝ քաղաքի համայնապատկերով…',
    fullDescription:
      'Բնակելի համալիր Արաբկիրում՝ կանաչ բակերով, ստորգետնյա ավտոկայանատեղիով և բնակարաններով 45–120 ք/մ…',
    locationText: 'օր. Արաբկիր, Երևան',
    address: 'օր. Կոմիտասի պող. 12',
    city: 'օր. Երևան',
    district: 'օր. Արաբկիր',
    projectType: 'օր. Բնակելի համալիր',
    constructionStatus: 'օր. Կառուցվում է',
  },
  ru: {
    name: 'напр. Saralanj View',
    slug: 'напр. saralanj-view',
    shortDescription: 'Современные квартиры с панорамным видом на город…',
    fullDescription:
      'Жилой комплекс в Арабкире с зелёными дворами, подземной парковкой и квартирами от 45 до 120 м²…',
    locationText: 'напр. Арабкир, Ереван',
    address: 'напр. пр. Комитаса 12',
    city: 'напр. Ереван',
    district: 'напр. Арабкир',
    projectType: 'напр. Жилой комплекс',
    constructionStatus: 'напр. Строится',
  },
};

const EN_CATALOG: Partial<Record<CatalogPlaceholderKey, string>> = {
  propertyType: 'e.g. Apartment',
  city: 'e.g. Yerevan',
  address: 'e.g. 12 Komitas Ave',
  constructionStatus: 'e.g. Under construction',
  bedroomsCount: 'e.g. 1–4',
  slogan: 'e.g. Live above the city',
  country: 'e.g. Armenia',
  zipCode: 'e.g. 0051',
  parkingAvailable: 'e.g. Yes — underground',
  storageAvailable: 'e.g. Yes — basement',
  elevator: 'e.g. Yes',
  elevatorsCount: 'e.g. 2',
  permitNumber: 'e.g. T-1234/2024',
  constructionType: 'e.g. Monolith',
  facadeMaterials: 'e.g. Stone + glass',
  thermalSoundInsulation: 'e.g. Triple glazing',
  seismicStandard: 'e.g. Zone 2',
  totalLandArea: 'e.g. 12,000 m²',
  totalResidentialArea: 'e.g. 28,000 m²',
  buildingsCount: 'e.g. 3',
  floorsCount: 'e.g. 12–16',
  apartmentsCount: 'e.g. 240',
  availableApartmentsCount: 'e.g. 86',
  ceilingHeightM: 'e.g. 2.8',
  heating: 'e.g. Central',
  cooling: 'e.g. Split A/C ready',
  hotWater: 'e.g. 24/7',
  gas: 'e.g. Individual',
  commercialAreaSqm: 'e.g. 1,200 m²',
  parkingSpaces: 'e.g. 180',
  openParkingSpaces: 'e.g. 40',
  closedParkingSpaces: 'e.g. 140',
  parkingStandardSizes: 'e.g. 2.5 × 5 m',
  schoolDistance: 'e.g. 400 m',
  kindergartenDistance: 'e.g. 250 m',
  distanceExtra: 'e.g. Metro — 800 m',
  economicZone: 'e.g. Primary',
  finishingStatus: 'e.g. White box',
  services: 'e.g. Concierge, gym, kids club',
  greenZones: 'e.g. Courtyard park, playground',
  territorialAdvantages: 'e.g. Quiet street, near park',
  views: 'e.g. Mount Ararat, city skyline',
  handoverDescription: 'e.g. Turnkey finishing included',
  areaMinSqm: 'e.g. 45',
  areaMaxSqm: 'e.g. 120',
  pricePerSqmMin: 'e.g. 420,000 AMD',
  pricePerSqmMax: 'e.g. 580,000 AMD',
  unitPriceMin: 'e.g. 28,000,000 AMD',
  unitPriceMax: 'e.g. 95,000,000 AMD',
  partnerBank: 'e.g. Ameriabank',
  parkingPrice: 'e.g. 6,000,000 AMD',
  paymentTypes: 'e.g. Cash, bank transfer, mortgage',
  installmentTerms: 'e.g. 0% for 24 months',
  mortgageTerms: 'e.g. From 8.5% for 20 years',
  specialTerms: 'e.g. Discount for early buyers',
  specialTermsAvailable: 'e.g. Yes',
  incomeTaxRefund: 'e.g. Eligible under state program',
  subsidizedPrograms: 'e.g. Affordable housing',
};

const HY_CATALOG: Partial<Record<CatalogPlaceholderKey, string>> = {
  propertyType: 'օր. Բնակարան',
  city: 'օր. Երևան',
  address: 'օր. Կոմիտասի պող. 12',
  constructionStatus: 'օր. Կառուցվում է',
  bedroomsCount: 'օր. 1–4',
  slogan: 'օր. Ապրիր քաղաքից վեր',
  country: 'օր. Հայաստան',
  zipCode: 'օր. 0051',
  parkingAvailable: 'օր. Այո — ստորգետնյա',
  storageAvailable: 'օր. Այո — նկուղ',
  elevator: 'օր. Այո',
  elevatorsCount: 'օր. 2',
  permitNumber: 'օր. Թ-1234/2024',
  constructionType: 'օր. Մոնոլիտ',
  facadeMaterials: 'օր. Քար + ապակի',
  thermalSoundInsulation: 'օր. Եռաշերտ ապակեպատում',
  seismicStandard: 'օր. Գոտի 2',
  totalLandArea: 'օր. 12,000 ք/մ',
  totalResidentialArea: 'օր. 28,000 ք/մ',
  buildingsCount: 'օր. 3',
  floorsCount: 'օր. 12–16',
  apartmentsCount: 'օր. 240',
  availableApartmentsCount: 'օր. 86',
  ceilingHeightM: 'օր. 2.8',
  heating: 'օր. Կենտրոնացված',
  cooling: 'օր. Split-ի պատրաստ',
  hotWater: 'օր. 24/7',
  gas: 'օր. Անհատական',
  commercialAreaSqm: 'օր. 1,200 ք/մ',
  parkingSpaces: 'օր. 180',
  openParkingSpaces: 'օր. 40',
  closedParkingSpaces: 'օր. 140',
  parkingStandardSizes: 'օր. 2.5 × 5 մ',
  schoolDistance: 'օր. 400 մ',
  kindergartenDistance: 'օր. 250 մ',
  distanceExtra: 'օր. Մետրո — 800 մ',
  economicZone: 'օր. Առաջնային',
  finishingStatus: 'օր. Սպիտակ տուփ',
  services: 'օր. Concierge, մարզասրահ, մանկական ակումբ',
  greenZones: 'օր. Բակի այգի, խաղահրապարակ',
  territorialAdvantages: 'օր. Հանգիստ փողոց, պուրակի մոտ',
  views: 'օր. Արարատ, քաղաքի համայնապատկեր',
  handoverDescription: 'օր. Ներառված է հանձնման վերանորոգում',
  areaMinSqm: 'օր. 45',
  areaMaxSqm: 'օր. 120',
  pricePerSqmMin: 'օր. 420,000 AMD',
  pricePerSqmMax: 'օր. 580,000 AMD',
  unitPriceMin: 'օր. 28,000,000 AMD',
  unitPriceMax: 'օր. 95,000,000 AMD',
  partnerBank: 'օր. Ամերիաբանկ',
  parkingPrice: 'օր. 6,000,000 AMD',
  paymentTypes: 'օր. Կանխիկ, փոխանցում, հիպոթեք',
  installmentTerms: 'օր. 0%՝ 24 ամիս',
  mortgageTerms: 'օր. Սկսած 8.5%՝ 20 տարի',
  specialTerms: 'օր. Զեղչ վաղ գնորդների համար',
  specialTermsAvailable: 'օր. Այո',
  incomeTaxRefund: 'օր. Պետական ծրագրով',
  subsidizedPrograms: 'օր. Մատչելի բնակարան',
};

const RU_CATALOG: Partial<Record<CatalogPlaceholderKey, string>> = {
  propertyType: 'напр. Квартира',
  city: 'напр. Ереван',
  address: 'напр. пр. Комитаса 12',
  constructionStatus: 'напр. Строится',
  bedroomsCount: 'напр. 1–4',
  slogan: 'напр. Живите над городом',
  country: 'напр. Армения',
  zipCode: 'напр. 0051',
  parkingAvailable: 'напр. Да — подземная',
  storageAvailable: 'напр. Да — подвал',
  elevator: 'напр. Да',
  elevatorsCount: 'напр. 2',
  permitNumber: 'напр. T-1234/2024',
  constructionType: 'напр. Монолит',
  facadeMaterials: 'напр. Камень + стекло',
  thermalSoundInsulation: 'напр. Тройное остекление',
  seismicStandard: 'напр. Зона 2',
  totalLandArea: 'напр. 12 000 м²',
  totalResidentialArea: 'напр. 28 000 м²',
  buildingsCount: 'напр. 3',
  floorsCount: 'напр. 12–16',
  apartmentsCount: 'напр. 240',
  availableApartmentsCount: 'напр. 86',
  ceilingHeightM: 'напр. 2.8',
  heating: 'напр. Центральное',
  cooling: 'напр. Подготовка под сплит',
  hotWater: 'напр. 24/7',
  gas: 'напр. Индивидуальный',
  commercialAreaSqm: 'напр. 1 200 м²',
  parkingSpaces: 'напр. 180',
  openParkingSpaces: 'напр. 40',
  closedParkingSpaces: 'напр. 140',
  parkingStandardSizes: 'напр. 2.5 × 5 м',
  schoolDistance: 'напр. 400 м',
  kindergartenDistance: 'напр. 250 м',
  distanceExtra: 'напр. Метро — 800 м',
  economicZone: 'напр. Первичная',
  finishingStatus: 'напр. White box',
  services: 'напр. Concierge, спортзал, детский клуб',
  greenZones: 'напр. Дворовой парк, площадка',
  territorialAdvantages: 'напр. Тихая улица, рядом парк',
  views: 'напр. Арарат, панорама города',
  handoverDescription: 'напр. Сдача с отделкой',
  areaMinSqm: 'напр. 45',
  areaMaxSqm: 'напр. 120',
  pricePerSqmMin: 'напр. 420 000 AMD',
  pricePerSqmMax: 'напр. 580 000 AMD',
  unitPriceMin: 'напр. 28 000 000 AMD',
  unitPriceMax: 'напр. 95 000 000 AMD',
  partnerBank: 'напр. Америабанк',
  parkingPrice: 'напр. 6 000 000 AMD',
  paymentTypes: 'напр. Наличные, перевод, ипотека',
  installmentTerms: 'напр. 0% на 24 месяца',
  mortgageTerms: 'напр. От 8.5% на 20 лет',
  specialTerms: 'напр. Скидка ранним покупателям',
  specialTermsAvailable: 'напр. Да',
  incomeTaxRefund: 'напр. По госпрограмме',
  subsidizedPrograms: 'напр. Доступное жильё',
};

const CATALOG_PLACEHOLDERS: Record<
  ContentLocale,
  Partial<Record<CatalogPlaceholderKey, string>>
> = {
  en: EN_CATALOG,
  hy: HY_CATALOG,
  ru: RU_CATALOG,
};

const LIST_PLACEHOLDERS: Record<ContentLocale, { amenity: string; nearby: string }> = {
  en: {
    amenity: 'e.g. Underground parking',
    nearby: 'e.g. School — 300 m',
  },
  hy: {
    amenity: 'օր. Ստորգետնյա ավտոկայանատեղի',
    nearby: 'օր. Դպրոց — 300 մ',
  },
  ru: {
    amenity: 'напр. Подземная парковка',
    nearby: 'напр. Школа — 300 м',
  },
};

const LINK_PLACEHOLDER = 'https://';

/** Project create/edit field example for a content language tab. */
export const getProjectFormPlaceholder = (
  contentLocale: string,
  key: ProjectFormPlaceholderKey,
): string => PROJECT_FORM_PLACEHOLDERS[resolveContentLocale(contentLocale)][key];

/** Catalog Overview/Details/Finance/Bank partner example for a content language tab. */
export const getCatalogFieldPlaceholder = (
  contentLocale: string,
  fieldKey: CatalogPlaceholderKey,
): string => {
  const locale = resolveContentLocale(contentLocale);
  return CATALOG_PLACEHOLDERS[locale][fieldKey] ?? CATALOG_PLACEHOLDERS.en[fieldKey] ?? '';
};

/** Features / Nearby list row example for a content language tab. */
export const getCatalogListPlaceholder = (
  contentLocale: string,
  kind: 'amenity' | 'nearby',
): string => LIST_PLACEHOLDERS[resolveContentLocale(contentLocale)][kind];

/** Shared URL field example (language-neutral). */
export const getUrlPlaceholder = (): string => LINK_PLACEHOLDER;
