import { CatalogListHero } from '@/features/catalog/components/catalog-list-hero';

/** Figma photo node `1:643`. */
const PARTNERS_HERO_IMAGE_SRC = '/demo/partner-facade.webp';

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
