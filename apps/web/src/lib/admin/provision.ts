import type { ProvisionAccountInput } from '@toonexpo/contracts';
import { slugifyCompanyName } from '@toonexpo/contracts';
import { prisma, Prisma } from '@toonexpo/db';

import { type AuditActor, recordAudit } from '@/lib/audit/record-audit';
import { hashPassword } from '@/lib/auth/password';
import { allocateUniqueSlug, MAX_SLUG_ATTEMPTS } from '@/lib/shared/unique-slug';

const UNIQUE_CONSTRAINT_ERROR = 'P2002';

export type ProvisionErrorCode = 'emailTaken' | 'invalidInput';

export type ProvisionAccountResult =
  { ok: true; userId: string; companyId?: string } | { ok: false; error: ProvisionErrorCode };

type ResolveCompanyResult = { ok: true; companyId: string } | { ok: false; error: 'invalidInput' };

function isEmailUniqueViolation(error: Prisma.PrismaClientKnownRequestError): boolean {
  const target = error.meta?.target;
  return Array.isArray(target) && target.includes('email');
}

async function findReusableCompanyId(
  tx: Prisma.TransactionClient,
  companyName: string,
  baseSlug: string,
): Promise<string | null> {
  for (let suffix = 0; suffix < MAX_SLUG_ATTEMPTS; suffix += 1) {
    const slug = suffix === 0 ? baseSlug : `${baseSlug}-${suffix}`;
    const existing = await tx.company.findUnique({ where: { slug } });
    if (existing?.name === companyName) {
      return existing.id;
    }
  }
  return null;
}

async function resolveCompanyId(
  tx: Prisma.TransactionClient,
  companyName: string,
): Promise<ResolveCompanyResult> {
  const baseSlug = slugifyCompanyName(companyName);
  const reusableId = await findReusableCompanyId(tx, companyName, baseSlug);
  if (reusableId) {
    return { ok: true, companyId: reusableId };
  }

  const slug = await allocateUniqueSlug(baseSlug, async (candidate) => {
    const existing = await tx.company.findUnique({ where: { slug: candidate } });
    return existing !== null;
  });
  if (!slug) {
    return { ok: false, error: 'invalidInput' };
  }

  const created = await tx.company.create({
    data: { name: companyName, slug },
  });
  return { ok: true, companyId: created.id };
}

async function linkPartnerCompany(
  tx: Prisma.TransactionClient,
  partnerId: string,
  companyId: string,
): Promise<ResolveCompanyResult> {
  const partner = await tx.partner.findUnique({
    where: { id: partnerId },
    select: { id: true, companyId: true },
  });

  if (!partner) {
    return { ok: false, error: 'invalidInput' };
  }

  if (partner.companyId && partner.companyId !== companyId) {
    return { ok: false, error: 'invalidInput' };
  }

  if (!partner.companyId) {
    await tx.partner.update({
      where: { id: partnerId },
      data: { companyId },
    });
  }

  return { ok: true, companyId };
}

/**
 * Provisions a non-buyer account (and optional company membership) in a single
 * transaction. Duplicate emails return a typed error without leaking details.
 * When role is PARTNER and partnerId is set, links Company → Partner.companyId.
 * Audit (PROVISION_ACCOUNT) is written inside the same transaction (atomic).
 * TODO(email-invite): send invitation email with temporary password.
 */
export async function provisionAccount(
  input: ProvisionAccountInput,
  actor: AuditActor,
): Promise<ProvisionAccountResult> {
  const passwordHash = await hashPassword(input.temporaryPassword);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email.toLowerCase(),
          name: input.name,
          passwordHash,
          role: input.role,
        },
      });

      let companyId: string | undefined;
      if (input.companyName) {
        const companyResult = await resolveCompanyId(tx, input.companyName);
        if (!companyResult.ok) {
          throw new ProvisionAbortError(companyResult.error);
        }
        companyId = companyResult.companyId;
        await tx.companyMember.create({
          data: {
            companyId,
            userId: user.id,
            role: input.role,
          },
        });

        if (input.partnerId) {
          const linkResult = await linkPartnerCompany(tx, input.partnerId, companyId);
          if (!linkResult.ok) {
            throw new ProvisionAbortError(linkResult.error);
          }
        }
      }

      await recordAudit(tx, {
        actor,
        action: 'PROVISION_ACCOUNT',
        entityType: 'USER',
        entityId: user.id,
        companyId: companyId ?? null,
        detail: input.role,
      });

      return { userId: user.id, companyId };
    });

    return { ok: true, ...result };
  } catch (error) {
    if (error instanceof ProvisionAbortError) {
      return { ok: false, error: error.code };
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_CONSTRAINT_ERROR
    ) {
      return {
        ok: false,
        error: isEmailUniqueViolation(error) ? 'emailTaken' : 'invalidInput',
      };
    }
    throw error;
  }
}

class ProvisionAbortError extends Error {
  readonly code: ProvisionErrorCode;

  constructor(code: ProvisionErrorCode) {
    super(code);
    this.code = code;
  }
}
