/** Public home hero image resolved from platform settings. */
export type PublicHomeHero = {
  mediaAssetId: string | null;
  imageUrl: string | null;
};

/** Admin home hero payload (includes last update time when configured). */
export type AdminHomeHero = PublicHomeHero & {
  updatedAt: string | null;
};

/** Admin PATCH body — `null` clears the custom hero (fallback to default asset). */
export type UpdateHomeHeroRequest = {
  mediaAssetId: string | null;
};
