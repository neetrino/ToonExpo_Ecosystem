import { prisma } from '@toonexpo/db';
import type { AnalyticsEventType } from '@toonexpo/domain';
import { after } from 'next/server';

export type RecordAnalyticsEventInput = {
  type: AnalyticsEventType;
  companyId: string;
  projectId?: string;
  apartmentId?: string;
};

/**
 * Inserts one analytics row. Never throws — failures are swallowed so product
 * paths stay unaffected. Bot noise is acceptable in v1 (no rate limiting).
 */
export async function recordAnalyticsEvent(input: RecordAnalyticsEventInput): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        type: input.type,
        companyId: input.companyId,
        projectId: input.projectId,
        apartmentId: input.apartmentId,
      },
    });
  } catch {
    // Analytics must never break render or mutations.
  }
}

/**
 * Schedules a fire-and-forget insert after the response via `after()`.
 * Falls back to a voided promise if `after` is unavailable outside a request.
 */
export function scheduleAnalyticsEvent(input: RecordAnalyticsEventInput): void {
  const run = (): void => {
    void recordAnalyticsEvent(input);
  };

  try {
    after(run);
  } catch {
    run();
  }
}
