import type { ApartmentDetail, MediaAssetSummary } from '@toonexpo/contracts';

export type ApartmentGalleryImage = {
  src: string;
  alt: string;
};

const GALLERY_IMAGE_LIMIT = 5;

type BuildApartmentGalleryImagesOptions = {
  apartment: Pick<ApartmentDetail, 'number' | 'plan' | 'cover' | 'gallery'>;
};

/**
 * Public apartment mosaic from admin-uploaded media only.
 * Uses gallery as the single source when present (already includes Main);
 * otherwise falls back to cover, then unit plan — never duplicates.
 */
export const buildApartmentGalleryImages = ({
  apartment,
}: BuildApartmentGalleryImagesOptions): ApartmentGalleryImage[] => {
  const unique: ApartmentGalleryImage[] = [];
  const seenKeys = new Set<string>();

  const pushMedia = (media: MediaAssetSummary | null | undefined, fallbackAlt: string): void => {
    if (media == null) {
      return;
    }
    const src = media.fileUrl.trim();
    if (src.length === 0) {
      return;
    }
    const key = media.id.trim().length > 0 ? `id:${media.id}` : `url:${src}`;
    if (seenKeys.has(key) || seenKeys.has(`url:${src}`)) {
      return;
    }
    seenKeys.add(key);
    seenKeys.add(`url:${src}`);
    unique.push({ src, alt: media.altText?.trim() || fallbackAlt });
  };

  if (apartment.gallery.length > 0) {
    for (const media of apartment.gallery) {
      pushMedia(media, apartment.number);
    }
  } else {
    pushMedia(apartment.cover, apartment.number);
    pushMedia(apartment.plan, apartment.number);
  }

  return unique.slice(0, GALLERY_IMAGE_LIMIT);
};
