import type { PublicCompanyProfile } from '@toonexpo/contracts';
import { publicCompanyProfileSchema } from '@toonexpo/contracts';
import type { PlatformRole } from '@toonexpo/domain';

import { serverApiRequest } from '@/lib/api/server';

const IS_DEV = process.env.NODE_ENV === 'development';

export type BuilderCompanyMemberRow = {
  id: string;
  name: string;
  email: string;
  role: PlatformRole;
  joinedAt: Date;
};

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
  void companyId;
  const row = await serverApiRequest<PublicCompanyProfile | null>('/builder/company/profile');

  if (!row) {
    return null;
  }

  return mapCompanyProfile(row);
}

/** Lists company members without sensitive user fields. */
export async function loadCompanyMembers(companyId: string): Promise<BuilderCompanyMemberRow[]> {
  void companyId;
  const rows = await serverApiRequest<
    Array<Omit<BuilderCompanyMemberRow, 'joinedAt'> & { joinedAt: string }>
  >('/builder/company/members');
  return rows.map((row) => ({ ...row, joinedAt: new Date(row.joinedAt) }));
}
