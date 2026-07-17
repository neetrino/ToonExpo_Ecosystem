import type { CheckInInput } from '@toonexpo/contracts';

import { serverApiRequest } from '@/lib/api/server';

export type CheckInMutationErrorKey =
  'unauthorized' | 'invalidInput' | 'notFound' | 'noActiveEvent' | 'alreadyCheckedIn';
export type CheckInMutationResult =
  | { ok: true; checkInId: string; alreadyCheckedIn: boolean; checkedInAt: Date }
  | { ok: false; errorKey: CheckInMutationErrorKey };
export type PerformCheckInParams = CheckInInput & { staffUserId: string };

export async function performEntranceCheckIn(
  raw: PerformCheckInParams,
): Promise<CheckInMutationResult> {
  const result = await serverApiRequest<
    | { ok: true; checkInId: string; alreadyCheckedIn?: boolean; checkedInAt: string }
    | { ok: false; errorKey: CheckInMutationErrorKey }
  >('/qr/check-in', {
    method: 'POST',
    body: { qrToken: raw.qrToken, eventId: raw.eventId },
  });
  return result.ok
    ? {
        ...result,
        alreadyCheckedIn: result.alreadyCheckedIn ?? false,
        checkedInAt: new Date(result.checkedInAt),
      }
    : result;
}
