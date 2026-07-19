import { SEED_BUILDERS, SEED_PROJECTS } from "./seed-data.js";

export type SeedTranslation = {
  id: string;
  entityType: string;
  entityId: string;
  fieldName: string;
  locale: "hy" | "ru" | "en";
  value: string;
};

const LOCALES = ["hy", "ru", "en"] as const;
type SeedLocale = (typeof LOCALES)[number];

const builderNames: Record<string, Record<SeedLocale, string>> = {
  [SEED_BUILDERS[0]!.id]: {
    hy: "Գլենդեյլ Հիլզ",
    ru: "Глендейл Хиллз",
    en: "Glendale Hills",
  },
  [SEED_BUILDERS[1]!.id]: {
    hy: "Քասքեյդ Դեվելոփմենթ",
    ru: "Каскейд Девелопмент",
    en: "Cascade Development",
  },
  [SEED_BUILDERS[2]!.id]: {
    hy: "Երևան Սիթի Բիլդերս",
    ru: "Ереван Сити Билдерс",
    en: "Yerevan City Builders",
  },
};

const builderDescriptions: Record<string, Record<SeedLocale, string>> = {
  [SEED_BUILDERS[0]!.id]: {
    hy: "Երևանի առաջատար կառուցապատող՝ բնակելի համալիրներով կենտրոնում։",
    ru: "Ведущий застройщик Еревана с жилыми комплексами в центре.",
    en: "Leading Yerevan developer with residential complexes downtown.",
  },
  [SEED_BUILDERS[1]!.id]: {
    hy: "Ժամանակակից աշտարակներ Քասքեյդի մոտ՝ բաց տեսարաններով։",
    ru: "Современные башни у Каскада с открытыми видами.",
    en: "Modern towers near the Cascade with open views.",
  },
  [SEED_BUILDERS[2]!.id]: {
    hy: "Ընտանեկան տներ և այգիներ Արաբկիրում։",
    ru: "Семейные дома и парки в Арабкире.",
    en: "Family homes and parks in Arabkir.",
  },
};

const projectNames: Record<string, Record<SeedLocale, string>> = {
  [SEED_PROJECTS[0]!.id]: {
    hy: "Հյուսիսային պողոտայի նստավայրեր",
    ru: "Резиденции на Северном проспекте",
    en: "Northern Avenue Residences",
  },
  [SEED_PROJECTS[1]!.id]: {
    hy: "Քասքեյդ Վյու",
    ru: "Каскейд Вью",
    en: "Cascade View",
  },
  [SEED_PROJECTS[2]!.id]: {
    hy: "Արաբկիր Պարկ Հոումս",
    ru: "Арабкир Парк Хоумс",
    en: "Arabkir Park Homes",
  },
  [SEED_PROJECTS[3]!.id]: {
    hy: "Դավթաշեն Սքայլայն",
    ru: "Давташен Скайлайн",
    en: "Davtashen Skyline",
  },
};

const projectShort: Record<string, Record<SeedLocale, string>> = {
  [SEED_PROJECTS[0]!.id]: {
    hy: "Էլիտար բնակարաններ Հյուսիսային պողոտայում",
    ru: "Элитные квартиры на Северном проспекте",
    en: "Premium apartments on Northern Avenue",
  },
  [SEED_PROJECTS[1]!.id]: {
    hy: "Ժամանակակից աշտարակ Քասքեյդի մոտ",
    ru: "Современная башня у Каскада",
    en: "Modern tower near the Cascade",
  },
  [SEED_PROJECTS[2]!.id]: {
    hy: "Կանաչ համալիր Արաբկիրում",
    ru: "Зелёный комплекс в Арабкире",
    en: "Green complex in Arabkir",
  },
  [SEED_PROJECTS[3]!.id]: {
    hy: "Բարձրահարկեր Դավթաշենում",
    ru: "Высотки в Давташене",
    en: "High-rises in Davtashen",
  },
};

const projectFull: Record<string, Record<SeedLocale, string>> = {
  [SEED_PROJECTS[0]!.id]: {
    hy: "Հյուսիսային պողոտայի նստավայրերը բնակելի համալիր է Կենտրոնում՝ հարմարավետ բնակարաններով և սպասարկմամբ։",
    ru: "Резиденции на Северном проспекте — жилой комплекс в Центре с комфортными квартирами и сервисом.",
    en: "Northern Avenue Residences is a residential development in Kentron with comfortable apartments and services.",
  },
  [SEED_PROJECTS[1]!.id]: {
    hy: "Քասքեյդ Վյուն առաջարկում է ժամանակակից բնակարաններ բաց տեսարաններով դեպի քաղաք։",
    ru: "Каскейд Вью предлагает современные квартиры с открытыми видами на город.",
    en: "Cascade View offers modern apartments with open city views.",
  },
  [SEED_PROJECTS[2]!.id]: {
    hy: "Արաբկիր Պարկ Հոումսը ընտանեկան համալիր է այգիներով և խաղահրապարակներով։",
    ru: "Арабкир Парк Хоумс — семейный комплекс с парками и игровыми площадками.",
    en: "Arabkir Park Homes is a family complex with parks and playgrounds.",
  },
  [SEED_PROJECTS[3]!.id]: {
    hy: "Դավթաշեն Սքայլայնը բարձրահարկ համալիր է հարմար տրանսպորտային հասանելիությամբ։",
    ru: "Давташен Скайлайн — высотный комплекс с удобной транспортной доступностью.",
    en: "Davtashen Skyline is a high-rise complex with convenient transport access.",
  },
};

const projectLocation: Record<string, Record<SeedLocale, string>> = {
  [SEED_PROJECTS[0]!.id]: {
    hy: "Կենտրոն, Երևան",
    ru: "Центр, Ереван",
    en: "Kentron, Yerevan",
  },
  [SEED_PROJECTS[1]!.id]: {
    hy: "Կենտրոն, Երևան",
    ru: "Центр, Ереван",
    en: "Kentron, Yerevan",
  },
  [SEED_PROJECTS[2]!.id]: {
    hy: "Արաբկիր, Երևան",
    ru: "Арабкир, Ереван",
    en: "Arabkir, Yerevan",
  },
  [SEED_PROJECTS[3]!.id]: {
    hy: "Դավթաշեն, Երևան",
    ru: "Давташен, Ереван",
    en: "Davtashen, Yerevan",
  },
};

const pushField = (
  out: SeedTranslation[],
  entityType: string,
  entityId: string,
  fieldName: string,
  values: Record<SeedLocale, string>,
): void => {
  for (const locale of LOCALES) {
    out.push({
      id: `seed_tr_${entityType}_${entityId}_${fieldName}_${locale}`,
      entityType,
      entityId,
      fieldName,
      locale,
      value: values[locale],
    });
  }
};

/**
 * Builds hy/ru/en Translation rows for seed builders and projects.
 */
export const buildSeedTranslations = (): SeedTranslation[] => {
  const rows: SeedTranslation[] = [];

  for (const builder of SEED_BUILDERS) {
    const names = builderNames[builder.id];
    const descriptions = builderDescriptions[builder.id];
    if (names) {
      pushField(rows, "company", builder.id, "name", names);
    }
    if (descriptions) {
      pushField(rows, "company", builder.id, "description", descriptions);
    }
  }

  for (const project of SEED_PROJECTS) {
    const names = projectNames[project.id];
    const shorts = projectShort[project.id];
    const fulls = projectFull[project.id];
    const locations = projectLocation[project.id];
    if (names) {
      pushField(rows, "project", project.id, "name", names);
    }
    if (shorts) {
      pushField(rows, "project", project.id, "shortDescription", shorts);
    }
    if (fulls) {
      pushField(rows, "project", project.id, "fullDescription", fulls);
    }
    if (locations) {
      pushField(rows, "project", project.id, "locationText", locations);
    }
  }

  return rows;
};
