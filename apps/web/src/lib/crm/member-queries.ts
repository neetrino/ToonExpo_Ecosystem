import { prisma } from '@toonexpo/db';

export type CompanyMemberOption = {
  userId: string;
  name: string;
};

/** Company members for CRM assignee selects. */
export async function loadCompanyMembers(companyId: string): Promise<CompanyMemberOption[]> {
  const members = await prisma.companyMember.findMany({
    where: { companyId },
    select: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { user: { name: 'asc' } },
  });

  return members.map((member) => ({
    userId: member.user.id,
    name: member.user.name ?? '—',
  }));
}
