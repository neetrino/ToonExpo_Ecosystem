import type { PartnerCompanyType } from '@toonexpo/contracts';

import { PARTNER_COMPANY_TYPES } from '@/features/partners/constants';

/** Builders lead the public exhibitors tabs; partner types follow. */
export const EXHIBITOR_TAB_BUILDER = 'builder' as const;

/** Sliding underline + scroll-into-view — matches `--duration-slow`. */
export const EXHIBITOR_TAB_SLIDE_MS = 400;

export const EXHIBITOR_TABS = [
  EXHIBITOR_TAB_BUILDER,
  ...PARTNER_COMPANY_TYPES,
] as const satisfies readonly PartnerCompanyType[];

export type ExhibitorTab = (typeof EXHIBITOR_TABS)[number];

const EXHIBITOR_TAB_SET = new Set<string>(EXHIBITOR_TABS);

export const isExhibitorTab = (value: string): value is ExhibitorTab =>
  EXHIBITOR_TAB_SET.has(value);

export const isExhibitorBuilderTab = (tab: ExhibitorTab): tab is typeof EXHIBITOR_TAB_BUILDER =>
  tab === EXHIBITOR_TAB_BUILDER;
