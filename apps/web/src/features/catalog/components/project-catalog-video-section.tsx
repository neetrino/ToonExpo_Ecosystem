import { ProjectCatalogMediaPoster } from '@/features/catalog/components/project-catalog-media-poster';
import { ProjectCatalogVideoFilePreview } from '@/features/catalog/components/project-catalog-video-file-preview';
import {
  resolveProjectCatalogVideoEmbed,
  resolveProjectCatalogVideoPreview,
} from '@/features/catalog/utils/resolve-project-catalog-video-embed';

type ProjectCatalogVideoSectionProps = {
  url: string;
  title: string;
  openLabel: string;
};

/**
 * Catalog media block — preview uses a real frame/thumbnail from the URL
 * (YouTube, Vimeo, Matterport, direct video file); no stock placeholders.
 */
export const ProjectCatalogVideoSection = async ({
  url,
  title,
  openLabel,
}: ProjectCatalogVideoSectionProps) => {
  const embed = resolveProjectCatalogVideoEmbed(url);
  if (embed?.kind === 'file') {
    return <ProjectCatalogVideoFilePreview src={embed.src} title={title} />;
  }

  if (embed?.kind === 'iframe') {
    return (
      <div className="relative aspect-video overflow-hidden rounded-xl bg-ink ring-1 ring-header-border">
        <iframe
          src={embed.src}
          title={title}
          className="size-full border-0"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; xr-spatial-tracking"
          allowFullScreen
        />
      </div>
    );
  }

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
