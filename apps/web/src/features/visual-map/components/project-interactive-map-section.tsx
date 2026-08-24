import { listProjectVisualCanvases } from '@/features/visual-map/api/public-visual-map-api';
import { PublicVisualMap } from '@/features/visual-map/components/public-visual-map';
import { pickPrimaryVisualCanvas } from '@/features/visual-map/utils/public-visual-map';

type ProjectInteractiveMapSectionProps = {
  projectId: string;
  projectSlug: string;
};

/**
 * Server section: loads published project canvas and renders public drill-down map.
 */
export const ProjectInteractiveMapSection = async ({
  projectId,
  projectSlug,
}: ProjectInteractiveMapSectionProps) => {
  const visualResponse = await listProjectVisualCanvases(projectId);
  const visualCanvas = pickPrimaryVisualCanvas(visualResponse?.data ?? []);

  if (!visualCanvas) {
    return null;
  }

  return (
    <div className="page-container section-pad pt-0">
      <PublicVisualMap
        canvas={visualCanvas}
        projectId={projectId}
        projectSlug={projectSlug}
      />
    </div>
  );
};
