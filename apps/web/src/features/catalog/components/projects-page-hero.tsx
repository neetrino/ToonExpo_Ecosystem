import { CatalogListHero } from '@/features/catalog/components/catalog-list-hero';

/** Same facade photo as partners list hero (Figma `1:643`). */
const PROJECTS_HERO_IMAGE_SRC = '/demo/partner-facade.webp';

type ProjectsPageHeroProps = {
  title: string;
  description: string;
};

/**
 * Full-bleed projects list hero — same chrome and photo as partners list hero.
 */
export const ProjectsPageHero = ({ title, description }: ProjectsPageHeroProps) => {
  return (
    <CatalogListHero title={title} description={description} imageSrc={PROJECTS_HERO_IMAGE_SRC} />
  );
};
