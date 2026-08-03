/**
 * Filters apartment listings to a single project when a map model is selected.
 * Pass `null` to return all listings (cleared map filter).
 */
export const filterListingsByProjectId = <T extends { projectId: string }>(
  listings: readonly T[],
  projectId: string | null,
): T[] => {
  if (projectId == null) {
    return [...listings];
  }
  return listings.filter((listing) => listing.projectId === projectId);
};
