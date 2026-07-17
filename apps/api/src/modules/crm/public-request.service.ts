import { Injectable } from '@nestjs/common';
import type { PublicRequestInput } from '@toonexpo/contracts';
import type { Prisma, PrismaClient } from '@toonexpo/db';
import type { ApartmentStatus, RequestSource } from '@toonexpo/domain';

import { type PrismaService } from '../../common/prisma.service';

type Tx = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

const OPEN_STAGES = [
  'NEW_REQUEST',
  'ASSIGNED',
  'CONTACTED',
  'FOLLOW_UP_NEEDED',
  'APARTMENT_SELECTED',
  'RESERVED',
] as const;
const DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class PublicRequestService {
  constructor(private readonly prisma: PrismaService) {}

  submit(input: PublicRequestInput, buyerUserId?: string) {
    return this.prisma.client.$transaction(async (tx) => {
      const project = await tx.project.findFirst({
        where: { id: input.projectId, status: 'PUBLISHED' },
        select: { id: true, companyId: true },
      });
      if (!project) return fail('notFound');
      const apartment = await resolveApartment(tx, input.apartmentId, project.id);
      if (input.apartmentId && !apartment) return fail('invalidInput');
      const source: RequestSource = input.apartmentId ? 'APARTMENT_PAGE' : 'PROJECT_PAGE';
      const existing = await tx.deal.findFirst({
        where: dedupWhere(project.companyId, project.id, input, buyerUserId),
        select: { id: true },
        orderBy: { createdAt: 'desc' },
      });
      if (existing) {
        await appendActivity(tx, existing.id, input.message, source, buyerUserId);
        return { ok: true as const, deduped: true as const, dealId: existing.id };
      }
      const deal = await tx.deal.create({
        data: {
          companyId: project.companyId,
          projectId: project.id,
          stage: 'NEW_REQUEST',
          source,
          buyerUserId,
          contactName: input.name,
          contactPhone: input.phone,
          contactEmail: input.email,
          message: input.message,
          lastActivityAt: new Date(),
          apartments: apartment
            ? {
                create: {
                  apartmentId: apartment.id,
                  priceAmdSnapshot: apartment.priceAmd,
                  statusSnapshot: apartment.status,
                },
              }
            : undefined,
          activities: {
            create: {
              authorUserId: buyerUserId,
              type: 'COMMENT',
              body: input.message ?? 'Inbound request from public catalog.',
            },
          },
        },
        select: { id: true },
      });
      return { ok: true as const, dealId: deal.id };
    });
  }
}

function resolveApartment(tx: Tx, apartmentId: string | undefined, projectId: string) {
  if (!apartmentId) return Promise.resolve(null);
  return tx.apartment.findFirst({
    where: {
      id: apartmentId,
      floor: {
        status: 'PUBLISHED',
        building: { status: 'PUBLISHED', projectId },
      },
    },
    select: { id: true, priceAmd: true, status: true },
  });
}

function dedupWhere(
  companyId: string,
  projectId: string,
  input: PublicRequestInput,
  buyerUserId?: string,
): Prisma.DealWhereInput {
  const identity: Prisma.DealWhereInput = buyerUserId
    ? { buyerUserId }
    : { OR: [{ contactEmail: input.email }, { contactPhone: input.phone }] };
  return {
    companyId,
    projectId,
    stage: { in: [...OPEN_STAGES] },
    createdAt: { gte: new Date(Date.now() - DEDUP_WINDOW_MS) },
    ...(input.apartmentId ? { apartments: { some: { apartmentId: input.apartmentId } } } : {}),
    ...identity,
  };
}

async function appendActivity(
  tx: Tx,
  dealId: string,
  message: string | undefined,
  source: RequestSource,
  buyerUserId?: string,
) {
  await tx.dealActivity.create({
    data: {
      dealId,
      authorUserId: buyerUserId,
      type: 'COMMENT',
      body:
        message ??
        (source === 'APARTMENT_PAGE'
          ? 'Repeated interest from apartment page.'
          : 'Repeated interest from project page.'),
    },
  });
  await tx.deal.update({ where: { id: dealId }, data: { lastActivityAt: new Date() } });
}

function fail(errorKey: 'notFound' | 'invalidInput') {
  return { ok: false as const, errorKey };
}

export type PublicApartmentSnapshot = {
  id: string;
  priceAmd: number | null;
  status: ApartmentStatus;
};
