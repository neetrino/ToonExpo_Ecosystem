import type { PublicBuilding } from '@toonexpo/contracts';
import type { PublicCanvas } from '@toonexpo/contracts';

import { getPublishedCanvasForContext } from '@/lib/visual-map/queries';

export type ProjectVisualMaps = {
  projectCanvas: PublicCanvas | null;
  floorCanvases: Record<string, PublicCanvas>;
};

export async function loadProjectVisualMaps(
  projectId: string,
  buildings: PublicBuilding[],
): Promise<ProjectVisualMaps> {
  const projectCanvas = await getPublishedCanvasForContext({ projectId });

  const floorIds = buildings.flatMap((building) => building.floors.map((floor) => floor.id));
  const floorResults = await Promise.all(
    floorIds.map(async (floorId) => ({
      floorId,
      canvas: await getPublishedCanvasForContext({ floorId }),
    })),
  );

  const floorCanvases: Record<string, PublicCanvas> = {};
  for (const entry of floorResults) {
    if (entry.canvas) {
      floorCanvases[entry.floorId] = entry.canvas;
    }
  }

  return { projectCanvas, floorCanvases };
}
