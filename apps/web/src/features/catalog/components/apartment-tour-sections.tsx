import { ProjectCatalogVideoSection } from '@/features/catalog/components/project-catalog-video-section';

type ApartmentTourSectionsProps = {
  matterportUrl: string | null;
  external3dUrl: string | null;
  matterportTitle: string;
  external3dTitle: string;
};

/**
 * Public apartment Matterport / external 3D tour previews (admin URL fields).
 * Uses real thumbnails from the URL when available — no stock placeholders.
 */
export const ApartmentTourSections = async ({
  matterportUrl,
  external3dUrl,
  matterportTitle,
  external3dTitle,
}: ApartmentTourSectionsProps) => {
  const matterport = matterportUrl?.trim() || null;
  const external3d = external3dUrl?.trim() || null;

  if (matterport == null && external3d == null) {
    return null;
  }

  return (
    <section className="space-y-8 py-10">
      {matterport != null ? (
        <div>
          <h2 className="mb-4 font-brand text-2xl font-bold tracking-tight text-ink-navy">
            {matterportTitle}
          </h2>
          <ProjectCatalogVideoSection
            url={matterport}
            title={matterportTitle}
            openLabel={matterportTitle}
          />
        </div>
      ) : null}

      {external3d != null ? (
        <div>
          <h2 className="mb-4 font-brand text-2xl font-bold tracking-tight text-ink-navy">
            {external3dTitle}
          </h2>
          <ProjectCatalogVideoSection
            url={external3d}
            title={external3dTitle}
            openLabel={external3dTitle}
          />
        </div>
      ) : null}
    </section>
  );
};
