import { prisma } from '@toonexpo/db';
import type { AnalyticsEventType } from '@toonexpo/domain';
import { after } from 'next/server';

import { isBotUserAgent, parseAnalyticsSampleRate, shouldSampleAnalyticsEvent } from './sampling';

export type RecordAnalyticsEventInput = {
  type: AnalyticsEventType;
  companyId: string;
  projectId?: string;
  apartmentId?: string;
  /** Optional — when provided, bot/prerender UAs are skipped. */
  userAgent?: string | null;
};

/**
 * Inserts one analytics row. Never throws — failures are swallowed so product
 * paths stay unaffected. Applies optional UA bot filter + view sampling.
 */
export async function recordAnalyticsEvent(input: RecordAnalyticsEventInput): Promise<void> {
  try {
    if (isBotUserAgent(input.userAgent)) {
      return;
    }

    const sampleRate = parseAnalyticsSampleRate(process.env.ANALYTICS_SAMPLE_RATE);
    if (!shouldSampleAnalyticsEvent(input.type, sampleRate)) {
      return;
    }

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
