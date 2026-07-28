import { ProjectCatalogMediaPoster } from '@/features/catalog/components/project-catalog-media-poster';
import { staticAssetUrl } from '@/shared/lib/static-asset-url';

/** Temporary poster until a real project video embed is wired. */
const VIDEO_PLACEHOLDER_SRC = staticAssetUrl('/images/hero-building.webp');

type ProjectCatalogVideoSectionProps = {
  /** Reserved for the future embed URL. */
  url: string;
  title: string;
  openLabel: string;
};

/**
 * Video block poster (placeholder image). Swap for embed when video is ready.
 */
export const ProjectCatalogVideoSection = ({ title }: ProjectCatalogVideoSectionProps) => {
  return <ProjectCatalogMediaPoster title={title} imageSrc={VIDEO_PLACEHOLDER_SRC} />;
};
