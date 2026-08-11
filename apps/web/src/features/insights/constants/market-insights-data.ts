/** Illustrative market pulse until a dedicated insights API exists. */

export type MarketTrendPoint = {
  monthKey: string;
  value: number;
};

export type MarketCityRow = {
  id: string;
  cityKey: string;
  activeListings: number;
  avgPerSqm: number;
  yoyChangePercent: number;
  demand: number;
};

export const MARKET_AVG_PER_SQM_AMD = 550_000;
export const MARKET_AVG_YOY_PERCENT = 4.2;
export const MARKET_MORTGAGE_RATE = 5.92;
export const MARKET_MORTGAGE_WEEKLY_DELTA = -0.08;
export const MARKET_MEDIAN_DAYS = 42;
export const MARKET_DEMAND_INDEX = 8.4;
export const MARKET_DEMAND_MAX = 10;

export const MARKET_PRICE_TREND: readonly MarketTrendPoint[] = [
  { monthKey: 'jul', value: 505_000 },
  { monthKey: 'aug', value: 512_000 },
  { monthKey: 'sep', value: 518_000 },
  { monthKey: 'oct', value: 522_000 },
  { monthKey: 'nov', value: 528_000 },
  { monthKey: 'dec', value: 531_000 },
  { monthKey: 'jan', value: 535_000 },
  { monthKey: 'feb', value: 538_000 },
  { monthKey: 'mar', value: 542_000 },
  { monthKey: 'apr', value: 545_000 },
  { monthKey: 'may', value: 548_000 },
  { monthKey: 'jun', value: 550_000 },
];

export const MARKET_CITY_ROWS: readonly MarketCityRow[] = [
  {
    id: 'yerevan',
    cityKey: 'yerevan',
    activeListings: 4_820,
    avgPerSqm: 620_000,
    yoyChangePercent: 5.1,
    demand: 8.0,
  },
  {
    id: 'abovyan',
    cityKey: 'abovyan',
    activeListings: 1_140,
    avgPerSqm: 410_000,
    yoyChangePercent: 3.9,
    demand: 7.2,
  },
  {
    id: 'gyumri',
    cityKey: 'gyumri',
    activeListings: 980,
    avgPerSqm: 290_000,
    yoyChangePercent: 2.7,
    demand: 6.4,
  },
  {
    id: 'vanadzor',
    cityKey: 'vanadzor',
    activeListings: 720,
    avgPerSqm: 265_000,
    yoyChangePercent: 2.1,
    demand: 6.0,
  },
  {
    id: 'dilijan',
    cityKey: 'dilijan',
    activeListings: 410,
    avgPerSqm: 480_000,
    yoyChangePercent: 4.5,
    demand: 7.6,
  },
  {
    id: 'tsaghkadzor',
    cityKey: 'tsaghkadzor',
    activeListings: 360,
    avgPerSqm: 520_000,
    yoyChangePercent: 3.3,
    demand: 6.8,
  },
];
