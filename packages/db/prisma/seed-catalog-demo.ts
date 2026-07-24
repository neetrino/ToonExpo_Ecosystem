/**
 * Spreadsheet-style catalog demo payload applied to published seed projects.
 * Source example: Myler Ski in Out row (layout + field coverage).
 */

export const CATALOG_DEMO_FULL_DESCRIPTION_HY = [
  'Թաղամասը գտնվում է լեռնադահուկային հանգստավայրի ամենապահանջված դիրքում, գտնվում է 2 ճոպանուղիների միջև։ Իր բնույթով հանդիսանում է Ski in Out դիրք, որը հնարավորություն է տալիս բնակիչներին շենքից անմիջապես հայտնվեն սահուղու վրա։ Տվյալ բնակարանները կունենան ներդրումների բարձր վերադարձելիություն, քանի որ առավել հարմար են վարձակալությունով տալու համար։',
].join('\n');

export const CATALOG_DEMO_FULL_DESCRIPTION_EN = [
  'The neighborhood sits in the most sought-after part of the ski resort, between two cableways. True ski-in/ski-out access lets residents step from the building onto the slopes. Units are well suited to rental yield.',
].join('\n');

export const CATALOG_DEMO_FULL_DESCRIPTION_RU = [
  'Квартал расположен в самом востребованном месте горнолыжного курорта, между двумя канатными дорогами. Формат ski-in/ski-out позволяет выходить на склон прямо из дома. Квартиры удобны для сдачи в аренду.',
].join('\n');

export const CATALOG_DEMO_DETAILS = {
  propertyType: 'Բնակելի համալիր',
  country: 'Հայաստան',
  city: 'Երևան',
  address: 'Գ. Եղիպատրուշ',
  brandName: 'Myler Mountain Resort',
  permitNumber: '01/18-Դ-160775-2871',
  constructionStart: '04/2025',
  constructionEnd: '12/2027',
  constructionStatus: 'Նախագծման փուլում',
  partnerBank: 'Արդշինբանկ ԲԲԸ',
  pricePerSqmMin: '700 000',
  pricePerSqmMax: '780 000',
  areaMinSqm: '30',
  areaMaxSqm: '60',
  unitPriceMin: '21 490 000',
  unitPriceMax: '46 282 500',
  managementFee: '7 000 000 ՀՀ դրամ',
  services: '24/7 անվտանգության ծառայություն, աղբահանություն',
  paymentTypes: 'Հիփոթեքային և տարաժամկետ',
  installmentTerms: '30% Կանխավճար, մնացած մասը հավասարաչափ մարումներով մինչև 31.12.2027',
  mortgageTerms: '10%–15% կանխավճար, մնացածը վարկավորումով, տվյալ պահին 12.1% տարեկան տոկոսադրույք',
  parkingAvailable: 'այո',
  storageAvailable: 'առկա է',
  elevator: 'այո',
  specialTerms:
    'Հատուկ պայմաններ կոնկրետ պետական աշխատակիցների և կամ Արցախից բռնի տեղահանված ընտանիքների համար',
  constructionType: 'մոնոլիտ',
  facadeMaterials: 'Փայտ, վայրի քար',
  seismicStandard: 'Ըստ ստանդարտների',
  buildingsCount: '6',
  apartmentsCount: '309',
  parkingSpaces: '142',
  ceilingHeightM: '3.00',
  floorsCount: '2',
  heating: 'Կենտրոնական',
  hotWater: 'Կենտրոնական',
  gas: 'այո',
  schoolDistance: '25',
  kindergartenDistance: '20',
  commercialAreaSqm: '18 ք/մ',
  distanceExtra: '45',
  economicZone: 'Ազատ տնտեսական գոտի',
  finishingStatus: 'Լիարժեք վերանորոգված',
  handoverDescription: 'Լիարժեք վերանորոգված',
} as const;

export const CATALOG_DEMO_AMENITY_LABELS = [
  'Բարեկարգված բակ',
  'Ռեստորաններ',
  'Հյուրանոցներ',
  'Ճոպանուղի',
  'Լեռնադահուկային հանգստավայր',
  '24/7 անվտանգության ծառայություն',
  'Աղբահանություն',
  'Կայանատեղի',
  'Պահեստ',
] as const;

export const CATALOG_DEMO_NEARBY_PLACES = ['Արագած', 'Մայլեռ դահուկային սահուղիներ'] as const;

/**
 * Builds amenities JSON for a seed project (demo spreadsheet fields + project address).
 */
export const buildCatalogDemoAmenities = (input: {
  city?: string | undefined;
  address?: string | undefined;
  district?: string | undefined;
}): {
  labels: string[];
  details: Record<string, string>;
} => ({
  labels: [...CATALOG_DEMO_AMENITY_LABELS],
  details: {
    ...CATALOG_DEMO_DETAILS,
    city: input.city?.trim() || CATALOG_DEMO_DETAILS.city,
    address: input.address?.trim() || input.district?.trim() || CATALOG_DEMO_DETAILS.address,
  },
});

export const CATALOG_DEMO_NEARBY = {
  places: [...CATALOG_DEMO_NEARBY_PLACES],
};
