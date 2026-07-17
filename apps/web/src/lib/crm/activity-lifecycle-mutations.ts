export { setActivityStatus } from './deal-mutations';

type FollowUpClient = {
  dealActivity: {
    findFirst(args: unknown): Promise<{ dueAt: Date | null } | null>;
  };
  deal: {
    update(args: unknown): Promise<unknown>;
  };
};

/** Retained as a pure transaction helper for legacy unit tests. */
export async function recomputeDealNextFollowUpAt(
  tx: FollowUpClient,
  dealId: string,
): Promise<void> {
  const next = await tx.dealActivity.findFirst({
    where: { dealId, type: 'FOLLOW_UP', status: 'PLANNED', dueAt: { not: null } },
    orderBy: { dueAt: 'asc' },
    select: { dueAt: true },
  });
  await tx.deal.update({
    where: { id: dealId },
    data: { nextFollowUpAt: next?.dueAt ?? null },
  });
}
