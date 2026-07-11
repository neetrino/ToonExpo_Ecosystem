import type { PublicMediaAsset } from '@toonexpo/contracts';
import Image from 'next/image';

import { CATALOG_IMAGE_HEIGHT, CATALOG_IMAGE_WIDTH } from '@/lib/catalog/image-dimensions';

type ProjectGalleryProps = {
  media: PublicMediaAsset[];
  projectName: string;
  galleryLabel: string;
};

export function ProjectGallery({ media, projectName, galleryLabel }: ProjectGalleryProps) {
  if (media.length === 0) {
    return null;
  }

  return (
    <section className="catalog-gallery">
      <h2 className="catalog-section-title">{galleryLabel}</h2>
      <div className="catalog-gallery__grid">
        {media.map((asset) => (
          <figure key={asset.id} className="catalog-gallery__item">
            <Image
              src={asset.url}
              alt={asset.alt ?? projectName}
              width={CATALOG_IMAGE_WIDTH}
              height={CATALOG_IMAGE_HEIGHT}
              className="catalog-gallery__image"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
