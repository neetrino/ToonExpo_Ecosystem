import { CatalogListHero } from '@/features/catalog/components/catalog-list-hero';
import { staticAssetUrl } from '@/shared/lib/static-asset-url';

/** Same facade photo as partners list hero (Figma `1:643`). */
const BUILDERS_HERO_IMAGE_SRC = staticAssetUrl('/demo/partner-facade.webp');

type BuildersPageHeroProps = {
  title: string;
  description: string;
};

/**
 * Full-bleed builders list hero — same chrome and photo as partners list hero.
 */
export const BuildersPageHero = ({ title, description }: BuildersPageHeroProps) => {
  return (
    <CatalogListHero title={title} description={description} imageSrc={BUILDERS_HERO_IMAGE_SRC} />
  );
};
