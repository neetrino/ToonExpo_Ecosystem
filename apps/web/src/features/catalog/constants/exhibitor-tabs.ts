import { PARTNER_COMPANY_TYPES } from '@/features/partners/constants';

/** Combined tab listing builders together with every partner type. */
export const EXHIBITOR_TAB_ALL = 'all' as const;

/** Builders lead the typed exhibitors tabs; partner types follow. */
export const EXHIBITOR_TAB_BUILDER = 'builder' as const;

/** Sliding underline + scroll-into-view — matches `--duration-slow`. */
export const EXHIBITOR_TAB_SLIDE_MS = 400;

/** First page of every exhibitors tab. */
export const EXHIBITOR_FIRST_PAGE = 1;

export const EXHIBITOR_TABS = [
  EXHIBITOR_TAB_ALL,
  EXHIBITOR_TAB_BUILDER,
  ...PARTNER_COMPANY_TYPES,
] as const;

export type ExhibitorTab = (typeof EXHIBITOR_TABS)[number];

/** Tabs backed by a partner profile type (everything except `all` and `builder`). */
export type ExhibitorPartnerTab = (typeof PARTNER_COMPANY_TYPES)[number];

const EXHIBITOR_TAB_SET = new Set<string>(EXHIBITOR_TABS);

export const isExhibitorTab = (value: string): value is ExhibitorTab =>
  EXHIBITOR_TAB_SET.has(value);

export const isExhibitorAllTab = (tab: ExhibitorTab): tab is typeof EXHIBITOR_TAB_ALL =>
  tab === EXHIBITOR_TAB_ALL;

export const isExhibitorBuilderTab = (tab: ExhibitorTab): tab is typeof EXHIBITOR_TAB_BUILDER =>
  tab === EXHIBITOR_TAB_BUILDER;
