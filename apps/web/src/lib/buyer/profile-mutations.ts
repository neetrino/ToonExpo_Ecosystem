import type { BuyerProfileUpdateInput } from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';

export type BuyerProfileMutationResult =
  | { ok: true }
  | { ok: false; errorKey: 'notFound' | 'invalidInput' | 'unauthorized' };

/** Updates the signed-in buyer's name and phone. Email/role are not writable here. */
export async function updateBuyerProfile(
  userId: string,
  input: BuyerProfileUpdateInput,
): Promise<BuyerProfileMutationResult> {
  const result = await prisma.user.updateMany({
    where: { id: userId, role: 'BUYER' },
    data: {
      name: input.name,
      phone: input.phone ?? null,
    },
  });

  if (result.count === 0) {
    return { ok: false, errorKey: 'notFound' };
  }

  return { ok: true };
}

export type BuyerProfileView = {
  name: string | null;
  email: string;
  phone: string | null;
};

export async function getBuyerProfile(userId: string): Promise<BuyerProfileView | null> {
  return prisma.user.findFirst({
    where: { id: userId, role: 'BUYER' },
    select: { name: true, email: true, phone: true },
  });
}
