import type { ProvisionAccountInput } from '@toonexpo/contracts';
import { slugifyCompanyName } from '@toonexpo/contracts';
import { prisma, Prisma } from '@toonexpo/db';

import { hashPassword } from '@/lib/auth/password';

const UNIQUE_CONSTRAINT_ERROR = 'P2002';

export type ProvisionErrorCode = 'emailTaken';

export type ProvisionAccountResult =
  { ok: true; userId: string; companyId?: string } | { ok: false; error: ProvisionErrorCode };

async function resolveCompanyId(
  tx: Prisma.TransactionClient,
  companyName: string,
): Promise<string> {
  const baseSlug = slugifyCompanyName(companyName);
  let slug = baseSlug;
  let suffix = 0;

  while (true) {
    const existing = await tx.company.findUnique({ where: { slug } });
    if (!existing) {
      const created = await tx.company.create({
        data: { name: companyName, slug },
      });
      return created.id;
    }
    if (existing.name === companyName) {
      return existing.id;
    }
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

/**
 * Provisions a non-buyer account (and optional company membership) in a single
 * transaction. Duplicate emails return a typed error without leaking details.
 * TODO(email-invite): send invitation email with temporary password.
 */
export async function provisionAccount(
  input: ProvisionAccountInput,
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
        companyId = await resolveCompanyId(tx, input.companyName);
        await tx.companyMember.create({
          data: {
            companyId,
            userId: user.id,
            role: input.role,
          },
        });
      }

      return { userId: user.id, companyId };
    });

    return { ok: true, ...result };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_CONSTRAINT_ERROR
    ) {
      return { ok: false, error: 'emailTaken' };
    }
    throw error;
  }
}
