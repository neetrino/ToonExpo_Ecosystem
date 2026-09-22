import Image from 'next/image';

import {
  CATALOG_OVERLAY_HERO_BODY_CLASS,
  CATALOG_OVERLAY_HERO_COPY_WIDTH_CLASS,
  CATALOG_OVERLAY_HERO_SCRIM_CLASS,
  CATALOG_OVERLAY_HERO_TITLE_CLASS,
} from '@/features/catalog/constants/catalog-overlay-hero';
import { cn } from '@/shared/ui/cn';

type CatalogListHeroProps = {
  title: string;
  description: string;
  imageSrc: string;
};

/**
 * Full-bleed public list hero (partners / projects) with existing page copy.
 */
export const CatalogListHero = ({ title, description, imageSrc }: CatalogListHeroProps) => {
  return (
    <section className="relative isolate flex min-h-[min(52vh,28rem)] flex-col bg-canvas sm:min-h-[min(56vh,32rem)]">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <Image
          src={imageSrc}
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className={CATALOG_OVERLAY_HERO_SCRIM_CLASS} />
      </div>

      <div
        className={cn(
          'page-container relative flex w-full flex-1 flex-col justify-end',
          'pt-[clamp(6.25rem,4.75rem+3.5vw,9.5rem)] pb-[clamp(2.5rem,2rem+2vw,4rem)]',
        )}
      >
        <div
          className={cn(
            'flex flex-col gap-[clamp(0.75rem,0.4rem+1.2vw,1.25rem)]',
            CATALOG_OVERLAY_HERO_COPY_WIDTH_CLASS,
          )}
        >
          <h1 className={CATALOG_OVERLAY_HERO_TITLE_CLASS}>{title}</h1>
          <p className={CATALOG_OVERLAY_HERO_BODY_CLASS}>{description}</p>
        </div>
      </div>
    </section>
  );
};
