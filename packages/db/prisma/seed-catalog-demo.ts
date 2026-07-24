/**
 * Spreadsheet-style catalog demo payload applied to published seed projects.
 * Values are localized (hy / ru / en) for public project detail pages.
 */

export type CatalogLocale = 'hy' | 'ru' | 'en';

export type CatalogLocaleText = Record<CatalogLocale, string>;

export type CatalogLocaleList = Record<CatalogLocale, string[]>;

export const CATALOG_DEMO_FULL_DESCRIPTION_HY =
  'Թաղամասը գտնվում է լեռնադահուկային հանգստավայրի ամենապահանջված դիրքում, գտնվում է 2 ճոպանուղիների միջև։ Իր բնույթով հանդիսանում է Ski in Out դիրք, որը հնարավորություն է տալիս բնակիչներին շենքից անմիջապես հայտնվեն սահուղու վրա։ Տվյալ բնակարանները կունենան ներդրումների բարձր վերադարձելիություն, քանի որ առավել հարմար են վարձակալությունով տալու համար։';

export const CATALOG_DEMO_FULL_DESCRIPTION_EN =
  'The neighborhood sits in the most sought-after part of the ski resort, between two cableways. True ski-in/ski-out access lets residents step from the building onto the slopes. Units are well suited to rental yield.';

export const CATALOG_DEMO_FULL_DESCRIPTION_RU =
  'Квартал расположен в самом востребованном месте горнолыжного курорта, между двумя канатными дорогами. Формат ski-in/ski-out позволяет выходить на склон прямо из дома. Квартиры удобны для сдачи в аренду.';

const t = (hy: string, ru: string, en: string): CatalogLocaleText => ({ hy, ru, en });

/** Localized demo detail fields (spreadsheet example). */
export const CATALOG_DEMO_DETAILS: Record<string, CatalogLocaleText | string> = {
  propertyType: t('Բնակելի համալիր', 'Жилой комплекс', 'Residential complex'),
  country: t('Հայաստան', 'Армения', 'Armenia'),
  city: t('Երևան', 'Ереван', 'Yerevan'),
  address: t('Գ. Եղիպատրուշ', 'с. Египатруш', 'Eghipatrush village'),
  brandName: 'Myler Mountain Resort',
  permitNumber: '01/18-Դ-160775-2871',
  constructionStart: '04/2025',
  constructionEnd: '12/2027',
  constructionStatus: t('Նախագծման փուլում', 'На стадии проектирования', 'In design phase'),
  partnerBank: t('Արդշինբանկ ԲԲԸ', 'Ардшинбанк ЗАО', 'Ardshinbank CJSC'),
  pricePerSqmMin: '700 000',
  pricePerSqmMax: '780 000',
  areaMinSqm: '30',
  areaMaxSqm: '60',
  unitPriceMin: '21 490 000',
  unitPriceMax: '46 282 500',
  managementFee: t('7 000 000 ՀՀ դրամ', '7 000 000 драмов РА', 'AMD 7,000,000'),
  services: t(
    '24/7 անվտանգության ծառայություն, աղբահանություն',
    'Охрана 24/7, вывоз мусора',
    '24/7 security, waste collection',
  ),
  paymentTypes: t('Հիփոթեքային և տարաժամկետ', 'Ипотека и рассрочка', 'Mortgage and installment'),
  installmentTerms: t(
    '30% Կանխավճար, մնացած մասը հավասարաչափ մարումներով մինչև 31.12.2027',
    '30% взнос, остаток равными долями до 31.12.2027',
    '30% down payment, balance in equal installments until 31.12.2027',
  ),
  mortgageTerms: t(
    '10%–15% կանխավճար, մնացածը վարկավորումով, տվյալ պահին 12.1% տարեկան տոկոսադրույք',
    '10%–15% взнос, остаток кредитом, ставка 12.1% годовых',
    '10%–15% down payment, remainder financed at 12.1% APR',
  ),
  parkingAvailable: t('այո', 'да', 'Yes'),
  storageAvailable: t('առկա է', 'есть', 'Available'),
  elevator: t('այո', 'да', 'Yes'),
  specialTerms: t(
    'Հատուկ պայմաններ կոնկրետ պետական աշխատակիցների և կամ Արցախից բռնի տեղահանված ընտանիքների համար',
    'Особые условия для госслужащих и/или семей, насильственно переселённых из Арцаха',
    'Special terms for public-sector employees and/or families forcibly displaced from Artsakh',
  ),
  constructionType: t('մոնոլիտ', 'монолит', 'Monolithic'),
  facadeMaterials: t('Փայտ, վայրի քար', 'Дерево, дикий камень', 'Wood, natural stone'),
  seismicStandard: t('Ըստ ստանդարտների', 'По стандартам', 'Per standards'),
  buildingsCount: '6',
  apartmentsCount: '309',
  parkingSpaces: '142',
  ceilingHeightM: '3.00',
  floorsCount: '2',
  heating: t('Կենտրոնական', 'Центральное', 'Central'),
  hotWater: t('Կենտրոնական', 'Центральная', 'Central'),
  gas: t('այո', 'да', 'Yes'),
  schoolDistance: '25',
  kindergartenDistance: '20',
  commercialAreaSqm: t('18 ք/մ', '18 м²', '18 m²'),
  distanceExtra: '45',
  economicZone: t('Ազատ տնտեսական գոտի', 'Свободная экономическая зона', 'Free economic zone'),
  finishingStatus: t('Լիարժեք վերանորոգված', 'С полной отделкой', 'Fully renovated'),
  handoverDescription: t('Լիարժեք վերանորոգված', 'С полной отделкой', 'Fully renovated'),
};

export const CATALOG_DEMO_AMENITY_LABELS: CatalogLocaleList = {
  hy: [
    'Բարեկարգված բակ',
    'Ռեստորաններ',
    'Հյուրանոցներ',
    'Ճոպանուղի',
    'Լեռնադահուկային հանգստավայր',
    '24/7 անվտանգության ծառայություն',
    'Աղբահանություն',
    'Կայանատեղի',
    'Պահեստ',
  ],
  ru: [
    'Благоустроенный двор',
    'Рестораны',
    'Отели',
    'Канатная дорога',
    'Горнолыжный курорт',
    'Охрана 24/7',
    'Вывоз мусора',
    'Паркинг',
    'Кладовая',
  ],
  en: [
    'Landscaped courtyard',
    'Restaurants',
    'Hotels',
    'Cableway',
    'Ski resort',
    '24/7 security',
    'Waste collection',
    'Parking',
    'Storage',
  ],
};

export const CATALOG_DEMO_NEARBY_PLACES: CatalogLocaleList = {
  hy: ['Արագած', 'Մայլեռ դահուկային սահուղիներ'],
  ru: ['Арагац', 'Лыжные трассы Майлер'],
  en: ['Aragats', 'Myler ski slopes'],
};

/** Demo marketing / media URLs (spreadsheet «հղում» columns). */
export const CATALOG_DEMO_LINKS: Record<string, string> = {
  exteriorRenders: 'https://example.com/exterior-renders',
  interiorRenders: 'https://example.com/interior-renders',
  typicalInteractiveTour: 'https://example.com/typical-tour',
  video: 'https://example.com/video',
  exteriorInteractiveTour: 'https://example.com/exterior-tour',
  floorPlans2d: 'https://example.com/floor-plans-2d',
  floorPlans3d: 'https://example.com/floor-plans-3d',
  logoBranding: 'https://example.com/logo-branding',
  website: 'https://example.com',
  facebook: 'https://facebook.com',
  instagram: 'https://instagram.com',
};

/**
 * Builds amenities JSON for a seed project (localized demo spreadsheet fields).
 * Keeps hy/ru/en value maps intact — do not overwrite with English-only project fields.
 */
export const buildCatalogDemoAmenities = (): {
  labels: CatalogLocaleList;
  details: Record<string, CatalogLocaleText | string>;
  links: Record<string, string>;
} => ({
  labels: CATALOG_DEMO_AMENITY_LABELS,
  details: { ...CATALOG_DEMO_DETAILS },
  links: { ...CATALOG_DEMO_LINKS },
});

export const CATALOG_DEMO_NEARBY = {
  places: CATALOG_DEMO_NEARBY_PLACES,
};
