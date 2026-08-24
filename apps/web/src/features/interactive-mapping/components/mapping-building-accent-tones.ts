export type MappingBuildingAccentTone = {
  indexPanelClass: string;
  indexTextClass: string;
  iconClass: string;
  actionButtonClass: string;
};

/** Single teal/green accent for all mapping building cards. */
const MAPPING_BUILDING_ACCENT_TONE: MappingBuildingAccentTone = {
  indexPanelClass: 'bg-brand-soft',
  indexTextClass: 'text-brand',
  iconClass: 'text-brand',
  actionButtonClass: 'bg-brand hover:bg-brand-hover',
};

/** Shared brand-teal accent for mapping building cards. */
export const mappingBuildingAccentTone = (_index: number): MappingBuildingAccentTone =>
  MAPPING_BUILDING_ACCENT_TONE;
