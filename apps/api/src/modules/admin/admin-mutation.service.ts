import { Inject, Injectable } from '@nestjs/common';
import {
  assessmentUpsertInputSchema,
  bankOfferStatusInputSchema,
  bankOfferUpsertInputSchema,
  companyProfileUpdateInputSchema,
  companyUpsertInputSchema,
  exhibitionEventUpsertInputSchema,
  partnerStatusInputSchema,
  partnerUpsertInputSchema,
  platformSettingUpdateInputSchema,
  projectPublicationInputSchema,
  provisionAccountSchema,
  readinessCategoryUpsertInputSchema,
  slugifyCompanyName,
} from '@toonexpo/contracts';
import { Prisma, type PrismaClient } from '@toonexpo/db';
import type { PlatformRole } from '@toonexpo/domain';

import { sendAccountInviteEmail } from '../../common/email/send-invite-email';
import { createAccountInvite } from '../../common/invite/create-account-invite';
import { buildInviteUrl } from '../../common/invite/invite-url';
import { PrismaService } from '../../common/prisma.service';

const UNIQUE_ERROR = 'P2002';
const MAX_SLUG_ATTEMPTS = 50;

type Actor = { userId: string; role: PlatformRole };
type Failure = { ok: false; errorKey: string };

@Injectable()
export class AdminMutationService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async execute(operation: string, raw: unknown, actor: Actor): Promise<unknown> {
    switch (operation) {
      case 'create-company': return this.createCompany(raw);
      case 'update-company': return this.updateCompany(raw);
      case 'project-publication': return this.projectPublication(raw, actor);
      case 'upsert-setting': return this.upsertSetting(raw, actor);
      case 'upsert-event': return this.upsertEvent(raw, actor);
      case 'create-partner': return this.createPartner(raw);
      case 'update-partner': return this.updatePartner(raw);
      case 'partner-status': return this.partnerStatus(raw, actor);
      case 'create-bank-offer': return this.createBankOffer(raw);
      case 'update-bank-offer': return this.updateBankOffer(raw);
      case 'bank-offer-status': return this.bankOfferStatus(raw, actor);
      case 'upsert-readiness-category': return this.upsertCategory(raw);
      case 'upsert-assessment': return this.upsertAssessment(raw, actor);
      case 'provision': return this.provision(raw, actor);
      default: return { ok: false, errorKey: 'invalidInput' };
    }
  }

  private async createCompany(raw: unknown): Promise<unknown> {
    const parsed = companyUpsertInputSchema.safeParse(raw);
    if (!parsed.success || parsed.data.companyId) return invalid();
    const slug = await this.uniqueSlug('company', slugifyCompanyName(parsed.data.name));
    if (!slug) return invalid();
    try {
      const row = await this.prisma.client.company.create({
        data: { name: parsed.data.name, slug }, select: { id: true },
      });
      return { ok: true, companyId: row.id };
    } catch (error) {
      if (isUnique(error)) return { ok: false, errorKey: 'nameTaken' };
      throw error;
    }
  }

  private async updateCompany(raw: unknown): Promise<unknown> {
    const parsed = companyProfileUpdateInputSchema.safeParse(raw);
    if (!parsed.success || !parsed.data.companyId) return invalid();
    const { companyId, ...data } = parsed.data;
    const result = await this.prisma.client.company.updateMany({
      where: { id: companyId },
      data: {
        name: data.name, description: data.description ?? null, logoUrl: data.logoUrl ?? null,
        phone: data.phone ?? null, email: data.email ?? null, website: data.website ?? null,
        city: data.city ?? null, address: data.address ?? null,
      },
    });
    return result.count ? { ok: true, companyId } : notFound();
  }

  private async projectPublication(raw: unknown, actor: Actor): Promise<unknown> {
    const parsed = projectPublicationInputSchema.safeParse(raw);
    if (!parsed.success) return invalid();
    return this.prisma.client.$transaction(async (tx) => {
      const existing = await tx.project.findUnique({
        where: { id: parsed.data.projectId },
        select: { id: true, status: true, companyId: true },
      });
      if (!existing) return notFound();
      await tx.project.update({ where: { id: existing.id }, data: { status: parsed.data.status } });
      await audit(tx, actor, 'PUBLICATION_CHANGE', 'PROJECT', existing.id,
        transition(existing.status, parsed.data.status), existing.companyId);
      return { ok: true, projectId: existing.id };
    });
  }

  private async upsertSetting(raw: unknown, actor: Actor): Promise<unknown> {
    const parsed = platformSettingUpdateInputSchema.safeParse(raw);
    if (!parsed.success) return invalid();
    return this.prisma.client.$transaction(async (tx) => {
      const existing = await tx.platformSetting.findUnique({ where: { key: parsed.data.key } });
      const setting = await tx.platformSetting.upsert({
        where: { key: parsed.data.key },
        update: { value: parsed.data.value, updatedByUserId: actor.userId },
        create: { key: parsed.data.key, value: parsed.data.value, updatedByUserId: actor.userId },
        select: { id: true },
      });
      await audit(tx, actor, 'SETTINGS_UPDATE', 'PLATFORM_SETTING', setting.id,
        `${parsed.data.key}: ${existing?.value ?? 'null'}→${parsed.data.value}`);
      return { ok: true, settingId: setting.id, key: parsed.data.key };
    });
  }

  private async upsertEvent(raw: unknown, actor: Actor): Promise<unknown> {
    const parsed = exhibitionEventUpsertInputSchema.safeParse(raw);
    if (!parsed.success) return invalid();
    const input = parsed.data;
    if (input.startDate && input.endDate && input.endDate < input.startDate) return invalid();
    try {
      return await this.prisma.client.$transaction(async (tx) => {
        if (input.status === 'ACTIVE') {
          const active = await tx.exhibitionEvent.findMany({
            where: { status: 'ACTIVE', ...(input.eventId ? { id: { not: input.eventId } } : {}) },
            select: { id: true, status: true },
          });
          await tx.exhibitionEvent.updateMany({
            where: { id: { in: active.map((row) => row.id) } }, data: { status: 'PLANNING' },
          });
          for (const row of active) {
            await audit(tx, actor, 'PUBLICATION_CHANGE', 'EXHIBITION_EVENT', row.id,
              transition(row.status, 'PLANNING'));
          }
        }
        const existing = input.eventId
          ? await tx.exhibitionEvent.findUnique({ where: { id: input.eventId } })
          : null;
        if (input.eventId && !existing) return notFound();
        const row = input.eventId
          ? await tx.exhibitionEvent.update({
              where: { id: input.eventId },
              data: { name: input.name, code: input.code.toLowerCase(), startDate: input.startDate ?? null,
                endDate: input.endDate ?? null, status: input.status },
            })
          : await tx.exhibitionEvent.create({
              data: { name: input.name, code: input.code.toLowerCase(), startDate: input.startDate,
                endDate: input.endDate, status: input.status },
            });
        if (!existing || existing.status !== input.status) {
          await audit(tx, actor, 'PUBLICATION_CHANGE', 'EXHIBITION_EVENT', row.id,
            transition(existing?.status ?? 'NEW', input.status));
        }
        return { ok: true, eventId: row.id };
      });
    } catch (error) {
      if (isUnique(error)) return { ok: false, errorKey: 'nameTaken' };
      throw error;
    }
  }

  private async createPartner(raw: unknown): Promise<unknown> {
    const parsed = partnerUpsertInputSchema.safeParse(raw);
    if (!parsed.success || parsed.data.partnerId) return invalid();
    const slug = await this.uniqueSlug('partner', slugifyCompanyName(parsed.data.name));
    if (!slug) return invalid();
    try {
      const row = await this.prisma.client.partner.create({
        data: { ...partnerData(parsed.data), slug }, select: { id: true, slug: true },
      });
      return { ok: true, partnerId: row.id, partnerSlug: row.slug };
    } catch (error) {
      if (isUnique(error)) return { ok: false, errorKey: 'nameTaken' };
      throw error;
    }
  }

  private async updatePartner(raw: unknown): Promise<unknown> {
    const parsed = partnerUpsertInputSchema.safeParse(raw);
    if (!parsed.success || !parsed.data.partnerId) return invalid();
    const existing = await this.prisma.client.partner.findUnique({
      where: { id: parsed.data.partnerId }, select: { id: true, slug: true },
    });
    if (!existing) return notFound();
    await this.prisma.client.partner.update({
      where: { id: existing.id }, data: partnerData(parsed.data),
    });
    return { ok: true, partnerId: existing.id, partnerSlug: existing.slug };
  }

  private async partnerStatus(raw: unknown, actor: Actor): Promise<unknown> {
    const parsed = partnerStatusInputSchema.safeParse(raw);
    if (!parsed.success) return invalid();
    return this.prisma.client.$transaction(async (tx) => {
      const existing = await tx.partner.findUnique({ where: { id: parsed.data.partnerId } });
      if (!existing) return notFound();
      await tx.partner.update({ where: { id: existing.id }, data: { status: parsed.data.status } });
      await audit(tx, actor, 'PUBLICATION_CHANGE', 'PARTNER', existing.id,
        transition(existing.status, parsed.data.status), existing.companyId);
      return { ok: true, partnerId: existing.id, partnerSlug: existing.slug };
    });
  }

  private async createBankOffer(raw: unknown): Promise<unknown> {
    const parsed = bankOfferUpsertInputSchema.safeParse(raw);
    if (!parsed.success || parsed.data.bankOfferId) return invalid();
    const partner = await this.bankPartner(parsed.data.partnerId);
    if (!partner.ok) return partner;
    const row = await this.prisma.client.bankOffer.create({
      data: { partnerId: parsed.data.partnerId, ...bankOfferData(parsed.data) },
      select: { id: true },
    });
    return { ok: true, bankOfferId: row.id, partnerSlug: partner.slug };
  }

  private async updateBankOffer(raw: unknown): Promise<unknown> {
    const parsed = bankOfferUpsertInputSchema.safeParse(raw);
    if (!parsed.success || !parsed.data.bankOfferId) return invalid();
    const partner = await this.bankPartner(parsed.data.partnerId);
    if (!partner.ok) return partner;
    const result = await this.prisma.client.bankOffer.updateMany({
      where: { id: parsed.data.bankOfferId, partnerId: parsed.data.partnerId },
      data: bankOfferData(parsed.data),
    });
    return result.count
      ? { ok: true, bankOfferId: parsed.data.bankOfferId, partnerSlug: partner.slug }
      : notFound();
  }

  private async bankOfferStatus(raw: unknown, actor: Actor): Promise<unknown> {
    const parsed = bankOfferStatusInputSchema.safeParse(raw);
    if (!parsed.success) return invalid();
    return this.prisma.client.$transaction(async (tx) => {
      const existing = await tx.bankOffer.findUnique({
        where: { id: parsed.data.bankOfferId },
        include: { partner: { select: { type: true, slug: true, companyId: true } } },
      });
      if (!existing) return notFound();
      if (existing.partner.type !== 'BANK') return { ok: false, errorKey: 'notBankPartner' };
      await tx.bankOffer.update({ where: { id: existing.id }, data: { status: parsed.data.status } });
      await audit(tx, actor, 'PUBLICATION_CHANGE', 'BANK_OFFER', existing.id,
        transition(existing.status, parsed.data.status), existing.partner.companyId);
      return { ok: true, bankOfferId: existing.id, partnerSlug: existing.partner.slug };
    });
  }

  private async upsertCategory(raw: unknown): Promise<unknown> {
    const parsed = readinessCategoryUpsertInputSchema.safeParse(raw);
    if (!parsed.success) return invalid();
    const input = parsed.data;
    try {
      if (input.categoryId) {
        const result = await this.prisma.client.readinessCategory.updateMany({
          where: { id: input.categoryId },
          data: { name: input.name, description: input.description ?? null, weight: input.weight ?? null,
            sortOrder: input.sortOrder, serviceCategoryKey: input.serviceCategoryKey ?? null, active: input.active },
        });
        return result.count ? { ok: true, categoryId: input.categoryId } : notFound();
      }
      if (!input.key) return invalid();
      const row = await this.prisma.client.readinessCategory.create({
        data: { key: input.key, name: input.name, description: input.description ?? null,
          weight: input.weight ?? null, sortOrder: input.sortOrder,
          serviceCategoryKey: input.serviceCategoryKey ?? null, active: input.active },
        select: { id: true },
      });
      return { ok: true, categoryId: row.id };
    } catch (error) {
      if (isUnique(error)) return { ok: false, errorKey: 'keyTaken' };
      throw error;
    }
  }

  private async upsertAssessment(raw: unknown, actor: Actor): Promise<unknown> {
    const parsed = assessmentUpsertInputSchema.safeParse(raw);
    if (!parsed.success) return invalid();
    const input = parsed.data;
    const target = input.targetType === 'BUILDER_COMPANY'
      ? await this.prisma.client.company.findUnique({ where: { id: input.companyId ?? '' }, select: { id: true } })
      : await this.prisma.client.project.findUnique({ where: { id: input.projectId ?? '' }, select: { id: true, companyId: true } });
    if (!target) return notFound();
    const companyId = 'companyId' in target ? target.companyId : target.id;
    const projectId = 'companyId' in target ? target.id : null;
    const categories = await this.prisma.client.readinessCategory.findMany({
      where: { active: true }, select: { id: true, weight: true },
    });
    const weights = new Map(categories.map((row) => [row.id, row.weight]));
    if (input.categoryScores.some((row) => !weights.has(row.categoryId))) return invalid();
    const overallScore = overall(input.categoryScores.map((row) => ({
      score: row.score, weight: weights.get(row.categoryId) ?? null,
    })));
    return this.prisma.client.$transaction(async (tx) => {
      const data = { targetType: input.targetType, companyId, projectId, status: input.status,
        overallScore, evaluatedByUserId: actor.userId, lastEvaluatedAt: new Date(),
        responsibleContact: input.responsibleContact ?? null, recommendation: input.recommendation ?? null,
        requiredActions: input.requiredActions ?? null, internalNotes: input.internalNotes ?? null };
      const assessment = input.assessmentId
        ? await tx.readinessAssessment.update({ where: { id: input.assessmentId }, data })
        : await tx.readinessAssessment.create({ data });
      await tx.readinessCategoryScore.deleteMany({ where: { assessmentId: assessment.id } });
      await tx.readinessCategoryScore.createMany({
        data: input.categoryScores.map((row) => ({
          assessmentId: assessment.id, categoryId: row.categoryId, score: row.score ?? null,
          status: row.status, recommendation: row.recommendation ?? null,
          requiredActions: row.requiredActions ?? null, internalNote: row.internalNote ?? null,
          evaluatedByUserId: actor.userId, evaluatedAt: new Date(),
        })),
      });
      await audit(tx, actor, 'READINESS_ASSESSMENT_UPSERT', 'READINESS_ASSESSMENT',
        assessment.id, `status:${input.status}; score:${overallScore ?? 'null'}`, companyId);
      return { ok: true, assessmentId: assessment.id };
    });
  }

  private async provision(raw: unknown, actor: Actor): Promise<unknown> {
    const parsed = provisionAccountSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: 'invalidInput' };
    try {
      const result = await this.prisma.client.$transaction(async (tx) => {
        const input = parsed.data;
        const user = await tx.user.create({
          data: { email: input.email.toLowerCase(), name: input.name, passwordHash: null, role: input.role },
        });
        let companyId: string | undefined;
        if (input.companyName) {
          const slug = await this.uniqueSlugTx(tx, 'company', slugifyCompanyName(input.companyName));
          if (!slug) throw new ProvisionAbort();
          const company = await tx.company.upsert({
            where: { slug }, update: {}, create: { name: input.companyName, slug },
          });
          companyId = company.id;
          await tx.companyMember.create({ data: { companyId, userId: user.id, role: input.role } });
          if (input.partnerId) {
            const partner = await tx.partner.findUnique({ where: { id: input.partnerId } });
            if (!partner || (partner.companyId && partner.companyId !== companyId)) throw new ProvisionAbort();
            await tx.partner.update({ where: { id: partner.id }, data: { companyId } });
          }
        }
        await audit(tx, actor, 'PROVISION_ACCOUNT', 'USER', user.id, input.role, companyId);
        return { userId: user.id, companyId, token: await createAccountInvite(tx, user.id) };
      });
      const inviteUrl = buildInviteUrl(result.token);
      const email = await sendAccountInviteEmail({
        to: parsed.data.email, name: parsed.data.name, inviteUrl,
      });
      return { ok: true, userId: result.userId, companyId: result.companyId,
        emailSent: email.sent, ...(process.env.NODE_ENV !== 'production' ? { inviteUrl } : {}) };
    } catch (error) {
      if (error instanceof ProvisionAbort) return { ok: false, error: 'invalidInput' };
      if (isUnique(error)) return { ok: false, error: 'emailTaken' };
      throw error;
    }
  }

  private async uniqueSlug(model: 'company' | 'partner', base: string): Promise<string | null> {
    return this.uniqueSlugTx(this.prisma.client, model, base);
  }

  private async uniqueSlugTx(
    client: Pick<PrismaClient, 'company' | 'partner'> | Prisma.TransactionClient,
    model: 'company' | 'partner',
    base: string,
  ): Promise<string | null> {
    for (let suffix = 0; suffix < MAX_SLUG_ATTEMPTS; suffix += 1) {
      const slug = suffix ? `${base}-${suffix}` : base;
      const found = model === 'company'
        ? await client.company.findUnique({ where: { slug }, select: { id: true } })
        : await client.partner.findUnique({ where: { slug }, select: { id: true } });
      if (!found) return slug;
    }
    return null;
  }

  private async bankPartner(id: string): Promise<{ ok: true; slug: string } | Failure> {
    const row = await this.prisma.client.partner.findUnique({
      where: { id }, select: { type: true, slug: true },
    });
    if (!row) return notFound();
    return row.type === 'BANK' ? { ok: true, slug: row.slug } : { ok: false, errorKey: 'notBankPartner' };
  }
}

function invalid(): Failure { return { ok: false, errorKey: 'invalidInput' }; }
function notFound(): Failure { return { ok: false, errorKey: 'notFound' }; }
function transition(from: string, to: string): string { return `${from}→${to}`; }
function isUnique(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_ERROR;
}

function partnerData(input: ReturnType<typeof partnerUpsertInputSchema.parse>) {
  return { name: input.name, type: input.type, logoUrl: input.logoUrl ?? null,
    description: input.description ?? null, phone: input.phone ?? null, email: input.email ?? null,
    website: input.website ?? null, serviceCategories: input.serviceCategories ?? [] };
}

function bankOfferData(input: ReturnType<typeof bankOfferUpsertInputSchema.parse>) {
  return { title: input.title, description: input.description ?? null, interestRate: input.interestRate,
    minDownPaymentPercent: input.minDownPaymentPercent, maxTermMonths: input.maxTermMonths,
    maxAmountAmd: input.maxAmountAmd ?? null, featured: input.featured ?? false };
}

function overall(rows: Array<{ score?: number; weight: number | null }>): number | null {
  const scored = rows.filter((row): row is { score: number; weight: number | null } => row.score !== undefined);
  if (!scored.length) return null;
  const weighted = scored.some((row) => row.weight !== null && row.weight > 0);
  const total = scored.reduce((sum, row) => sum + row.score * (weighted ? (row.weight ?? 1) : 1), 0);
  const divisor = scored.reduce((sum, row) => sum + (weighted ? (row.weight ?? 1) : 1), 0);
  return Math.round(total / divisor);
}

async function audit(
  tx: Prisma.TransactionClient,
  actor: Actor,
  action: Parameters<typeof tx.auditLog.create>[0]['data']['action'],
  entityType: Parameters<typeof tx.auditLog.create>[0]['data']['entityType'],
  entityId: string,
  detail: string,
  companyId?: string | null,
): Promise<void> {
  await tx.auditLog.create({ data: { actorUserId: actor.userId, actorRole: actor.role,
    action, entityType, entityId, detail, companyId: companyId ?? null } });
}

class ProvisionAbort extends Error {}
