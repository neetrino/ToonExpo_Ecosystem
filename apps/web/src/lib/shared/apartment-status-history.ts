import type { ApartmentStatus, ApartmentStatusChangeSource } from '@toonexpo/domain';

type StatusHistoryTx = {
  apartmentStatusHistory: {
    create: (args: {
      data: {
        apartmentId: string;
        dealId: string | null;
        source: ApartmentStatusChangeSource;
        oldStatus: ApartmentStatus;
        newStatus: ApartmentStatus;
        changedByUserId: string;
        reason: string | null;
      };
    }) => Promise<unknown>;
    createMany: (args: {
      data: Array<{
        apartmentId: string;
        dealId: string | null;
        source: ApartmentStatusChangeSource;
        oldStatus: ApartmentStatus;
        newStatus: ApartmentStatus;
        changedByUserId: string;
        reason: string | null;
      }>;
    }) => Promise<unknown>;
  };
};

export type ApartmentStatusHistoryWrite = {
  apartmentId: string;
  dealId?: string | null;
  source: ApartmentStatusChangeSource;
  oldStatus: ApartmentStatus;
  newStatus: ApartmentStatus;
  changedByUserId: string;
  reason?: string | null;
};

/**
 * Appends one status-history row inside an existing transaction.
 * No-ops when old and new status are identical.
 */
export async function recordApartmentStatusHistory(
  tx: StatusHistoryTx,
  input: ApartmentStatusHistoryWrite,
): Promise<void> {
  if (input.oldStatus === input.newStatus) {
    return;
  }

  await tx.apartmentStatusHistory.create({
    data: {
      apartmentId: input.apartmentId,
      dealId: input.dealId ?? null,
      source: input.source,
      oldStatus: input.oldStatus,
      newStatus: input.newStatus,
      changedByUserId: input.changedByUserId,
      reason: input.reason ?? null,
    },
  });
}

/**
 * Bulk-append history for apartments whose status actually changed.
 */
export async function recordApartmentStatusHistoryMany(
  tx: StatusHistoryTx,
  rows: ApartmentStatusHistoryWrite[],
): Promise<void> {
  const data = rows.filter((row) => row.oldStatus !== row.newStatus);
  if (data.length === 0) {
    return;
  }

  await tx.apartmentStatusHistory.createMany({
    data: data.map((row) => ({
      apartmentId: row.apartmentId,
      dealId: row.dealId ?? null,
      source: row.source,
      oldStatus: row.oldStatus,
      newStatus: row.newStatus,
      changedByUserId: row.changedByUserId,
      reason: row.reason ?? null,
    })),
  });
}
