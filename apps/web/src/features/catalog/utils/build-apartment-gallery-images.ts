import type { ApartmentDetail, MediaAssetSummary, ProjectDetail } from '@toonexpo/contracts';

export type ApartmentGalleryImage = {
  src: string;
  alt: string;
};

const GALLERY_IMAGE_LIMIT = 5;

type BuildApartmentGalleryImagesOptions = {
  apartment: Pick<ApartmentDetail, 'number' | 'plan' | 'cover' | 'building'>;
  project: ProjectDetail | null;
  /** Floor plan for this apartment's floor, when available. */
  floorplan?: MediaAssetSummary | null;
  /** Extra images (e.g. sibling unit covers) to fill the mosaic. */
  extraImages?: ReadonlyArray<ApartmentGalleryImage | null | undefined>;
};

/**
 * Builds a full apartment mosaic (1 hero + 4 thumbs). Pads by cycling unique
 * sources when fewer than five distinct photos exist.
 */
export const buildApartmentGalleryImages = ({
  apartment,
  project,
  floorplan = null,
  extraImages = [],
}: BuildApartmentGalleryImagesOptions): ApartmentGalleryImage[] => {
  const unique: ApartmentGalleryImage[] = [];
  const seenUrls = new Set<string>();

  const pushImage = (src: string | null | undefined, alt: string): void => {
    const normalized = src?.trim();
    if (!normalized || seenUrls.has(normalized)) {
      return;
    }
    seenUrls.add(normalized);
    unique.push({ src: normalized, alt });
  };

  const pushMedia = (media: MediaAssetSummary | null | undefined, fallbackAlt: string): void => {
    pushImage(media?.fileUrl, media?.altText?.trim() || fallbackAlt);
  };

  pushMedia(apartment.cover, apartment.number);
  pushMedia(apartment.plan, apartment.number);
  pushMedia(project?.cover, project?.name ?? apartment.number);
  pushMedia(floorplan, apartment.building.name);

  const apartmentBuilding = project?.buildings.find(
    (building) => building.id === apartment.building.id,
  );
  pushMedia(apartmentBuilding?.cover, apartment.building.name);

  for (const building of project?.buildings ?? []) {
    pushMedia(building.cover, building.name);
  }

  for (const image of extraImages) {
    if (image == null) {
      continue;
    }
    pushImage(image.src, image.alt);
  }

  return fillGallerySlots(unique, GALLERY_IMAGE_LIMIT);
};

const fillGallerySlots = (
  unique: ApartmentGalleryImage[],
  limit: number,
): ApartmentGalleryImage[] => {
  if (unique.length === 0) {
    return [];
  }
  if (unique.length >= limit) {
    return unique.slice(0, limit);
  }

  const filled: ApartmentGalleryImage[] = [];
  let index = 0;
  while (filled.length < limit) {
    const source = unique[index % unique.length];
    if (source == null) {
      break;
    }
    filled.push(source);
    index += 1;
  }
  return filled;
};
