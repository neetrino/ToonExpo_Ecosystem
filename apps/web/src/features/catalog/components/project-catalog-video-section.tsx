import { ProjectCatalogMediaPoster } from '@/features/catalog/components/project-catalog-media-poster';
import { ProjectCatalogVideoFilePreview } from '@/features/catalog/components/project-catalog-video-file-preview';
import { resolveProjectCatalogVideoPreview } from '@/features/catalog/utils/resolve-project-catalog-video-embed';

type ProjectCatalogVideoSectionProps = {
  url: string;
  title: string;
  openLabel: string;
};

/**
 * Project video block — preview uses a real frame/thumbnail from the video URL.
 */
export const ProjectCatalogVideoSection = async ({
  url,
  title,
  openLabel,
}: ProjectCatalogVideoSectionProps) => {
  const preview = await resolveProjectCatalogVideoPreview(url);

  if (preview == null) {
    return null;
  }

  if (preview.kind === 'file') {
    return <ProjectCatalogVideoFilePreview src={preview.src} title={title} />;
  }

  if (preview.kind === 'poster') {
    return (
      <ProjectCatalogMediaPoster
        title={title}
        imageSrc={preview.posterSrc}
        href={preview.href}
        openLabel={openLabel}
        {...(preview.posterFallbackSrc != null
          ? { imageFallbackSrc: preview.posterFallbackSrc }
          : {})}
      />
    );
  }

  return (
    <ProjectCatalogMediaPoster title={title} href={preview.href} openLabel={openLabel} />
  );
};
