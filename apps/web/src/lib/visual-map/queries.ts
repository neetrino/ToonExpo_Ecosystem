import { serverApiRequest } from '@/lib/api/server';

export type BuilderCanvasSummary = {
  id: string;
  title: string | null;
  imageUrl: string;
  imageAlt: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  projectId: string | null;
  buildingId: string | null;
  floorId: string | null;
  hotspotCount: number;
  updatedAt: Date;
};
export type BuilderCanvasDetail = BuilderCanvasSummary & {
  hotspots: Array<{
    id: string;
    x: number;
    y: number;
    label: string | null;
    sortOrder: number;
    buildingId: string | null;
    floorId: string | null;
    apartmentId: string | null;
  }>;
};
export type BuilderArchivedHotspot = {
  id: string;
  x: number;
  y: number;
  label: string | null;
  archivedAt: Date;
};

export async function listCanvasesForProject(
  companyId: string,
  projectId: string,
): Promise<BuilderCanvasSummary[]> {
  const rows = await serverApiRequest<
    Array<
      Omit<BuilderCanvasSummary, 'updatedAt'> & {
        updatedAt: string;
      }
    >
  >(
    `/visual-map/builder/projects/${encodeURIComponent(projectId)}?companyId=${encodeURIComponent(companyId)}`,
  );
  return rows.map((row) => ({ ...row, updatedAt: new Date(row.updatedAt) }));
}

export async function getCanvasForEdit(
  companyId: string,
  canvasId: string,
): Promise<BuilderCanvasDetail | null> {
  const row = await serverApiRequest<
    (Omit<BuilderCanvasDetail, 'updatedAt'> & { updatedAt: string }) | null
  >(
    `/visual-map/builder/canvases/${encodeURIComponent(canvasId)}?companyId=${encodeURIComponent(companyId)}`,
  );
  return row ? { ...row, updatedAt: new Date(row.updatedAt) } : null;
}

export async function listArchivedHotspotsForCanvas(
  companyId: string,
  canvasId: string,
): Promise<BuilderArchivedHotspot[]> {
  const rows = await serverApiRequest<
    Array<
      Omit<BuilderArchivedHotspot, 'archivedAt'> & {
        archivedAt: string;
      }
    >
  >(
    `/visual-map/builder/canvases/${encodeURIComponent(canvasId)}/archived-hotspots?companyId=${encodeURIComponent(companyId)}`,
  );
  return rows.map((row) => ({ ...row, archivedAt: new Date(row.archivedAt) }));
}

export { getPublishedCanvasForContext, type PublicCanvasContext } from './public-queries';
