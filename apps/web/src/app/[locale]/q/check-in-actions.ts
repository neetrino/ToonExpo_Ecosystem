import { assertEntranceSession } from '@/lib/entrance/assert-entrance-session';
import { performEntranceCheckIn, type CheckInMutationResult } from '@/lib/qr/check-in-mutations';

function revalidateCheckInPaths(..._args: unknown[]): void {
  void _args;
}

export async function performCheckInAction(
  locale: string,
  raw: unknown,
): Promise<CheckInMutationResult> {
  const session = await assertEntranceSession();
  if (!session) {
    return { ok: false, errorKey: 'unauthorized' };
  }

  if (!raw || typeof raw !== 'object') {
    return { ok: false, errorKey: 'invalidInput' };
  }

  const payload = raw as Record<string, unknown>;
  const result = await performEntranceCheckIn({
    qrToken: typeof payload.qrToken === 'string' ? payload.qrToken : '',
    eventId: typeof payload.eventId === 'string' ? payload.eventId : undefined,
    staffUserId: session.user.id,
  });

  if (result.ok) {
    revalidateCheckInPaths(locale);
  }
  return result;
}
