import {
  buildInviteIdentifier,
  generateInviteToken,
  hashInviteToken,
  inviteExpiresAt,
} from './invite-token';

type InviteTransaction = {
  verificationToken: {
    deleteMany(args: unknown): Promise<unknown>;
    create(args: unknown): Promise<unknown>;
  };
};

/** Legacy pure helper retained for tests; production invite creation is Nest-owned. */
export async function createAccountInvite(
  tx: InviteTransaction,
  userId: string,
): Promise<string> {
  const identifier = buildInviteIdentifier(userId);
  await tx.verificationToken.deleteMany({ where: { identifier } });
  const rawToken = generateInviteToken();
  await tx.verificationToken.create({
    data: { identifier, token: hashInviteToken(rawToken), expires: inviteExpiresAt() },
  });
  return rawToken;
}
