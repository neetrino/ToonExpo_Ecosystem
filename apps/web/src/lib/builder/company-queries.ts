import type { PublicCompanyProfile } from '@toonexpo/contracts';
import { publicCompanyProfileSchema } from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';
import type { PlatformRole } from '@toonexpo/domain';

const IS_DEV = process.env.NODE_ENV === 'development';

export type BuilderCompanyMemberRow = {
  id: string;
  name: string;
  email: string;
  role: PlatformRole;
  joinedAt: Date;
};

const companyProfileSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  logoUrl: true,
  phone: true,
  email: true,
  website: true,
  city: true,
  address: true,
} as const;

function mapCompanyProfile(row: {
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  city: string | null;
  address: string | null;
}): PublicCompanyProfile {
  const profile: PublicCompanyProfile = {
    name: row.name,
    slug: row.slug,
    description: row.description,
    logoUrl: row.logoUrl,
    phone: row.phone,
    email: row.email,
    website: row.website,
    city: row.city,
    address: row.address,
  };
  return IS_DEV ? publicCompanyProfileSchema.parse(profile) : profile;
}

/** Returns the builder company profile for portal display. */
export async function loadCompanyProfile(companyId: string): Promise<PublicCompanyProfile | null> {
  const row = await prisma.company.findUnique({
    where: { id: companyId },
    select: companyProfileSelect,
  });

  if (!row) {
    return null;
  }

  return mapCompanyProfile(row);
}

/** Lists company members without sensitive user fields. */
export async function loadCompanyMembers(companyId: string): Promise<BuilderCompanyMemberRow[]> {
  const rows = await prisma.companyMember.findMany({
    where: { companyId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      role: true,
      createdAt: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.user.name?.trim() || row.user.email,
    email: row.user.email,
    role: row.role,
    joinedAt: row.createdAt,
  }));
}
