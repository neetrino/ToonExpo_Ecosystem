import type { BuyerRegisterInput } from '@toonexpo/contracts';
import { prisma, Prisma } from '@toonexpo/db';

import { ensureBuyerQr } from '@/lib/qr/mutations';

import { hashPassword } from './password';

const UNIQUE_CONSTRAINT_ERROR = 'P2002';

export type RegisterErrorCode = 'emailTaken';

export type RegisterBuyerResult =
  { ok: true; userId: string } | { ok: false; error: RegisterErrorCode };

/**
 * Creates a BUYER user together with its buyer profile in a single
 * transaction. The password is hashed with argon2id before persistence.
 * Duplicate emails are reported without leaking further account details.
 * Issues a permanent opaque QR after registration (01-QR-Lifecycle).
 */
export async function registerBuyer(input: BuyerRegisterInput): Promise<RegisterBuyerResult> {
  const passwordHash = await hashPassword(input.password);

  try {
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: input.email.toLowerCase(),
          name: input.name,
          phone: input.phone,
          passwordHash,
          role: 'BUYER',
        },
      });

      await tx.buyerProfile.create({ data: { userId: created.id } });

      return created;
    });

    await ensureBuyerQr(user.id);

    return { ok: true, userId: user.id };
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
