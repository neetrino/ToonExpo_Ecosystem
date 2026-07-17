import type {
  ApartmentStatus,
  ApartmentStatusChangeSource,
  PriceVisibility,
  PublicationStatus,
} from '@toonexpo/domain';
import {
  evaluateProjectCompleteness,
  type ProjectCompletenessKey,
} from '@/lib/projects/project-completeness';
import { apiRequest } from '@/lib/api/client';
import { getApiErrorKey } from '@/lib/api/errors';

/** Max status-history rows shown in the apartment editor sheet. */
const APARTMENT_STATUS_HISTORY_PREVIEW_LIMIT = 10;

export type ProjectStatusCounts = {
  draft: number;
  published: number;
  archived: number;
};

export type BuilderProjectRow = {
  id: string;
  name: string;
  city: string | null;
  status: PublicationStatus;
  updatedAt: Date;
  buildingsCount: number;
  completenessMissingKeys: ProjectCompletenessKey[];
};

export async function loadProjectStatusCounts(companyId: string): Promise<ProjectStatusCounts> {
  void companyId;
  const groups = await apiRequest<Array<{ status: PublicationStatus; _count: { _all: number } }>>(
    '/builder/projects/counts',
  );

  return mapProjectStatusCounts(groups);
}

export async function loadCompanyProjects(companyId: string): Promise<BuilderProjectRow[]> {
  void companyId;
  const projects = await apiRequest<
    Array<{
      id: string;
      name: string;
      city: string | null;
      status: PublicationStatus;
      updatedAt: string;
      description: string | null;
      _count: { buildings: number; media: number; canvases: number };
      buildings: Array<{
        status: PublicationStatus;
        floors: Array<{ status: PublicationStatus; _count: { apartments: number } }>;
      }>;
    }>
  >('/builder/projects');

  return projects.map((project) => {
    const completeness = evaluateProjectCompleteness({
      description: project.description,
      hasCoverMedia: project._count.media > 0,
      hasCanvas: project._count.canvases > 0,
      buildings: project.buildings.map((building) => ({
        status: building.status,
        floors: building.floors.map((floor) => ({
          status: floor.status,
          apartmentCount: floor._count.apartments,
        })),
      })),
    });

    return {
      id: project.id,
      name: project.name,
      city: project.city,
      status: project.status,
      updatedAt: new Date(project.updatedAt),
      buildingsCount: project._count.buildings,
      completenessMissingKeys: completeness.missingKeys,
    };
  });
}

function mapProjectStatusCounts(
  groups: ReadonlyArray<{ status: PublicationStatus; _count: { _all: number } }>,
): ProjectStatusCounts {
  const counts: ProjectStatusCounts = { draft: 0, published: 0, archived: 0 };

  for (const group of groups) {
    if (group.status === 'DRAFT') {
      counts.draft = group._count._all;
    } else if (group.status === 'PUBLISHED') {
      counts.published = group._count._all;
    } else if (group.status === 'ARCHIVED') {
      counts.archived = group._count._all;
    }
  }

  return counts;
}

export type BuilderApartmentStatusHistoryEntry = {
  id: string;
  oldStatus: ApartmentStatus;
  newStatus: ApartmentStatus;
  source: ApartmentStatusChangeSource;
  reason: string | null;
  createdAt: Date;
};

export type BuilderProjectApartment = {
  id: string;
  code: string;
  rooms: number | null;
  areaSqm: number | null;
  priceAmd: number | null;
  priceVisibility: PriceVisibility;
  matterportUrl: string | null;
  status: ApartmentStatus;
  media: BuilderMediaAsset[];
  statusHistory: BuilderApartmentStatusHistoryEntry[];
};

export type BuilderMediaAsset = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
};

export type BuilderProjectFloor = {
  id: string;
  name: string;
  level: number;
  status: PublicationStatus;
  apartments: BuilderProjectApartment[];
};

export type BuilderProjectBuilding = {
  id: string;
  name: string;
  description: string | null;
  status: PublicationStatus;
  floors: BuilderProjectFloor[];
};

export type BuilderProjectDetail = {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  address: string | null;
  status: PublicationStatus;
  media: BuilderMediaAsset[];
  buildings: BuilderProjectBuilding[];
};

export async function loadCompanyProjectDetail(
  companyId: string,
  projectId: string,
): Promise<BuilderProjectDetail | null> {
  void companyId;
  void APARTMENT_STATUS_HISTORY_PREVIEW_LIMIT;
  try {
    const detail = await apiRequest<BuilderProjectDetail>(
      `/builder/projects/${encodeURIComponent(projectId)}`,
    );
    for (const building of detail.buildings) {
      for (const floor of building.floors) {
        for (const apartment of floor.apartments) {
          apartment.statusHistory = apartment.statusHistory.map((entry) => ({
            ...entry,
            createdAt: new Date(entry.createdAt),
          }));
        }
      }
    }
    return detail;
  } catch (error) {
    if (getApiErrorKey(error) === 'notFound') return null;
    throw error;
  }
}
