type ProjectCatalogVideoFilePreviewProps = {
  src: string;
  title: string;
};

/**
 * Native file video preview — browser shows a frame from the file itself.
 */
export const ProjectCatalogVideoFilePreview = ({
  src,
  title,
}: ProjectCatalogVideoFilePreviewProps) => {
  return (
    <div
      className={
        'relative aspect-video overflow-hidden rounded-xl bg-ink ring-1 ring-header-border'
      }
    >
      <video
        src={src}
        className="size-full object-cover"
        controls
        preload="metadata"
        playsInline
        aria-label={title}
      />
    </div>
  );
};
