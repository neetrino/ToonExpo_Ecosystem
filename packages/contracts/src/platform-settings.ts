/** One resolved home hero slide (media id + public R2 URL). */
export type HomeHeroSlide = {
  mediaAssetId: string;
  imageUrl: string;
};

/**
 * Public home hero — ordered slides for the carousel.
 * Empty `slides` → client uses the default static asset.
 */
export type PublicHomeHero = {
  slides: HomeHeroSlide[];
};

/** Admin home hero payload (includes last update time when configured). */
export type AdminHomeHero = PublicHomeHero & {
  updatedAt: string | null;
};

/**
 * Admin PATCH body — ordered media asset ids.
 * `null` or `[]` clears custom banners (fallback to default asset).
 */
export type UpdateHomeHeroRequest = {
  mediaAssetIds: string[] | null;
};
