import { CatalogListHero } from '@/features/catalog/components/catalog-list-hero';
import { staticAssetUrl } from '@/shared/lib/static-asset-url';

/** Figma photo node `1:643`. */
const PARTNERS_HERO_IMAGE_SRC = staticAssetUrl('/demo/partner-facade.webp');

type PartnersPageHeroProps = {
  title: string;
  description: string;
};

/**
 * Full-bleed partners list hero — Figma `1:643` with existing page copy.
 */
export const PartnersPageHero = ({ title, description }: PartnersPageHeroProps) => {
  return (
    <CatalogListHero title={title} description={description} imageSrc={PARTNERS_HERO_IMAGE_SRC} />
  );
};
