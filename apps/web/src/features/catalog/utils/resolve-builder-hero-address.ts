import type { ProjectListItem } from '@toonexpo/contracts';

/**
 * Picks a public address line for the builder hero from published projects.
 */
export const resolveBuilderHeroAddress = (projects: readonly ProjectListItem[]): string | null => {
  for (const project of projects) {
    const address = project.address?.trim() || null;
    const district = project.district?.trim() || null;
    const city = project.city?.trim() || null;
    const location = project.locationText?.trim() || null;

    if (address && city) {
      return `${address} · ${city}`;
    }
    if (address && district) {
      return `${address} · ${district}`;
    }
    if (district && city) {
      return `${district} · ${city}`;
    }
    if (address) {
      return address;
    }
    if (location) {
      return location;
    }
    if (city) {
      return city;
    }
  }

  return null;
};
