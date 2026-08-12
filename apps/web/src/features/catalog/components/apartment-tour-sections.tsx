import { ProjectCatalogMediaPoster } from '@/features/catalog/components/project-catalog-media-poster';
import { staticAssetUrl } from '@/shared/lib/static-asset-url';

const MATTERPORT_TOUR_POSTER_SRC = staticAssetUrl('/images/project-floor-axonometric.webp');
const EXTERNAL_3D_TOUR_POSTER_SRC = staticAssetUrl('/images/hero-variant-a.webp');

type ApartmentTourSectionsProps = {
  matterportUrl: string | null;
  external3dUrl: string | null;
  matterportTitle: string;
  external3dTitle: string;
};

/**
 * Public apartment Matterport / external 3D tour posters (admin URL fields).
 */
export const ApartmentTourSections = ({
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
          <ProjectCatalogMediaPoster
            title={matterportTitle}
            imageSrc={MATTERPORT_TOUR_POSTER_SRC}
            href={matterport}
          />
        </div>
      ) : null}

      {external3d != null ? (
        <div>
          <h2 className="mb-4 font-brand text-2xl font-bold tracking-tight text-ink-navy">
            {external3dTitle}
          </h2>
          <ProjectCatalogMediaPoster
            title={external3dTitle}
            imageSrc={EXTERNAL_3D_TOUR_POSTER_SRC}
            href={external3d}
          />
        </div>
      ) : null}
    </section>
  );
};
