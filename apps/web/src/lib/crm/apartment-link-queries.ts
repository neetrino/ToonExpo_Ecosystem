import type { ApartmentStatus } from '@toonexpo/domain';
import { prisma } from '@toonexpo/db';

export type ApartmentLinkOption = {
  apartmentId: string;
  code: string;
  buildingName: string;
  floorName: string;
  status: ApartmentStatus;
  priceAmd: number | null;
};

export type ProjectApartmentGroup = {
  projectId: string;
  projectName: string;
  apartments: ApartmentLinkOption[];
};

/** Apartments available for linking to a CRM deal (scoped to company, optionally one project). */
export async function loadApartmentLinkOptions(
  companyId: string,
  projectId?: string | null,
): Promise<ProjectApartmentGroup[]> {
  const projects = await prisma.project.findMany({
    where: {
      companyId,
      ...(projectId ? { id: projectId } : {}),
    },
    select: {
      id: true,
      name: true,
      buildings: {
        select: {
          name: true,
          floors: {
            select: {
              name: true,
              apartments: {
                select: {
                  id: true,
                  code: true,
                  status: true,
                  priceAmd: true,
                },
                orderBy: { code: 'asc' },
              },
            },
            orderBy: { level: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  });

  return projects
    .map((project) => ({
      projectId: project.id,
      projectName: project.name,
      apartments: project.buildings.flatMap((building) =>
        building.floors.flatMap((floor) =>
          floor.apartments.map((apartment) => ({
            apartmentId: apartment.id,
            code: apartment.code,
            buildingName: building.name,
            floorName: floor.name,
            status: apartment.status,
            priceAmd: apartment.priceAmd,
          })),
        ),
      ),
    }))
    .filter((group) => group.apartments.length > 0);
}
