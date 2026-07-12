import type { PartnerType, PublicationStatus } from '@toonexpo/domain';
import { prisma } from '@toonexpo/db';

import type { ProjectStatusCounts } from '@/lib/builder/queries';

export type AdminCompanyRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  city: string | null;
  address: string | null;
  membersCount: number;
  projectsCount: ProjectStatusCounts;
  createdAt: Date;
};

export type AdminProjectRow = {
  id: string;
  name: string;
  companyName: string;
  status: PublicationStatus;
  buildingsCount: number;
  updatedAt: Date;
};

export type AdminPartnerRow = {
  id: string;
  name: string;
  slug: string;
  type: PartnerType;
  status: PublicationStatus;
  offersCount: number;
  updatedAt: Date;
};

export type AdminPartnerDetail = {
  id: string;
  name: string;
  slug: string;
  type: PartnerType;
  logoUrl: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  serviceCategories: string[];
  status: PublicationStatus;
  companyId: string | null;
  bankOffers: AdminBankOfferRow[];
};

export type AdminBankOfferRow = {
  id: string;
  title: string;
  description: string | null;
  interestRate: number;
  minDownPaymentPercent: number;
  maxTermMonths: number;
  maxAmountAmd: number | null;
  featured: boolean;
  status: PublicationStatus;
  updatedAt: Date;
};

export type AdminPartnerOption = {
  id: string;
  name: string;
  type: PartnerType;
};

function emptyProjectStatusCounts(): ProjectStatusCounts {
  return { draft: 0, published: 0, archived: 0 };
}

function applyProjectGroup(
  counts: ProjectStatusCounts,
  status: PublicationStatus,
  count: number,
): void {
  if (status === 'DRAFT') {
    counts.draft = count;
  } else if (status === 'PUBLISHED') {
    counts.published = count;
  } else {
    counts.archived = count;
  }
}

export async function loadAllCompanies(): Promise<AdminCompanyRow[]> {
  const [companies, projectGroups] = await Promise.all([
    prisma.company.findMany({
      select: {
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
        createdAt: true,
        _count: { select: { members: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.project.groupBy({
      by: ['companyId', 'status'],
      _count: { _all: true },
    }),
  ]);

  const countsByCompany = new Map<string, ProjectStatusCounts>();

  for (const group of projectGroups) {
    const counts = countsByCompany.get(group.companyId) ?? emptyProjectStatusCounts();
    applyProjectGroup(counts, group.status, group._count._all);
    countsByCompany.set(group.companyId, counts);
  }

  return companies.map((company) => ({
    id: company.id,
    name: company.name,
    slug: company.slug,
    description: company.description,
    logoUrl: company.logoUrl,
    phone: company.phone,
    email: company.email,
    website: company.website,
    city: company.city,
    address: company.address,
    membersCount: company._count.members,
    projectsCount: countsByCompany.get(company.id) ?? emptyProjectStatusCounts(),
    createdAt: company.createdAt,
  }));
}

export async function loadAllProjects(
  statusFilter?: PublicationStatus,
): Promise<AdminProjectRow[]> {
  const projects = await prisma.project.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    select: {
      id: true,
      name: true,
      status: true,
      updatedAt: true,
      company: { select: { name: true } },
      _count: { select: { buildings: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    companyName: project.company.name,
    status: project.status,
    buildingsCount: project._count.buildings,
    updatedAt: project.updatedAt,
  }));
}

export async function loadAllPartners(typeFilter?: PartnerType): Promise<AdminPartnerRow[]> {
  const partners = await prisma.partner.findMany({
    where: typeFilter ? { type: typeFilter } : undefined,
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      status: true,
      updatedAt: true,
      _count: { select: { bankOffers: true } },
    },
    orderBy: { name: 'asc' },
  });

  return partners.map((partner) => ({
    id: partner.id,
    name: partner.name,
    slug: partner.slug,
    type: partner.type,
    status: partner.status,
    offersCount: partner._count.bankOffers,
    updatedAt: partner.updatedAt,
  }));
}

export async function loadPartnerDetail(partnerId: string): Promise<AdminPartnerDetail | null> {
  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      logoUrl: true,
      description: true,
      phone: true,
      email: true,
      website: true,
      serviceCategories: true,
      status: true,
      companyId: true,
      bankOffers: {
        select: {
          id: true,
          title: true,
          description: true,
          interestRate: true,
          minDownPaymentPercent: true,
          maxTermMonths: true,
          maxAmountAmd: true,
          featured: true,
          status: true,
          updatedAt: true,
        },
        orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }],
      },
    },
  });

  if (!partner) {
    return null;
  }

  return partner;
}

export async function loadPartnerOptions(): Promise<AdminPartnerOption[]> {
  const partners = await prisma.partner.findMany({
    select: { id: true, name: true, type: true },
    orderBy: { name: 'asc' },
  });
  return partners;
}
