import { prisma } from '@toonexpo/db';

export type PortalCompanyOption = {
  id: string;
  name: string;
};

/** Companies a builder may switch into (memberships, earliest first). */
export async function loadBuilderCompanyOptions(userId: string): Promise<PortalCompanyOption[]> {
  const rows = await prisma.companyMember.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    select: {
      company: { select: { id: true, name: true } },
    },
  });
  return rows.map((row) => row.company);
}

/** All companies for admin portal switcher (name ascending). */
export async function loadAdminCompanyOptions(): Promise<PortalCompanyOption[]> {
  return prisma.company.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
}
