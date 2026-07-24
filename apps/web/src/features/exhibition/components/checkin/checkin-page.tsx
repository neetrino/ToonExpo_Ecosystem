'use client';

import type { ActiveEventResponse, CheckInScanResponse } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { ScannerCamera } from '@/features/builder/components/scanner-camera';
import { extractQrToken, isNonToonexpoQrPayload } from '@/features/builder/utils/extract-qr-token';
import { CheckinRecentList } from '@/features/exhibition/components/checkin/checkin-recent-list';
import { CheckinResultCard } from '@/features/exhibition/components/checkin/checkin-result-card';
import { CHECKIN_RESULT_RESET_MS } from '@/features/exhibition/constants';
import {
  useCheckinActiveEventQuery,
  useCheckinRecentQuery,
  useCheckinScanMutation,
} from '@/features/exhibition/hooks/use-checkin';
import { formatEventDateRange } from '@/features/exhibition/utils/format-event-dates';
import { Card } from '@/shared/ui/card';

type ScanPhase = { phase: 'scanning' } | { phase: 'result'; result: CheckInScanResponse };

/**
 * Entrance staff check-in scanner page content.
 */
export const CheckinPage = () => {
  const t = useTranslations('Checkin');
  const locale = useLocale();
  const eventQuery = useCheckinActiveEventQuery();
  const [scanPhase, setScanPhase] = useState<ScanPhase>({ phase: 'scanning' });

  const event = eventQuery.data ?? null;
  const recentQuery = useCheckinRecentQuery(event?.id ?? '');
  const scanMutation = useCheckinScanMutation(event?.id ?? '');

  useEffect(() => {
    if (scanPhase.phase !== 'result') {
      return;
    }
    const timer = window.setTimeout(() => {
      setScanPhase({ phase: 'scanning' });
    }, CHECKIN_RESULT_RESET_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [scanPhase]);

  const handleScan = async (raw: string) => {
    if (!event || scanPhase.phase === 'result' || scanMutation.isPending) {
      return;
    }

    if (isNonToonexpoQrPayload(raw)) {
      setScanPhase({
        phase: 'result',
        result: {
          status: 'denied_invalid_qr',
          visitorDisplayName: null,
          checkedInAt: null,
          duplicateWarning: false,
        },
      });
      return;
    }

    const token = extractQrToken(raw);
    if (!token) {
      setScanPhase({
        phase: 'result',
        result: {
          status: 'denied_invalid_qr',
          visitorDisplayName: null,
          checkedInAt: null,
          duplicateWarning: false,
        },
      });
      return;
    }

    try {
      const result = await scanMutation.mutateAsync({ token });
      setScanPhase({ phase: 'result', result });
    } catch {
      setScanPhase({
        phase: 'result',
        result: {
          status: 'error',
          visitorDisplayName: null,
          checkedInAt: null,
          duplicateWarning: false,
        },
      });
    }
  };

  if (eventQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (eventQuery.isError) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  if (!event) {
    return (
      <Card className="px-4 py-8 text-center">
        <h1 className="text-lg font-semibold text-ink">{t('noEvent.title')}</h1>
        <p className="mt-2 text-sm text-ink-secondary">{t('noEvent.message')}</p>
      </Card>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <EventHeader event={event} locale={locale} />
      {scanPhase.phase === 'result' ? (
        <CheckinResultCard
          result={scanPhase.result}
          onScanNext={() => {
            setScanPhase({ phase: 'scanning' });
          }}
        />
      ) : (
        <ScannerCamera
          paused={scanMutation.isPending}
          onToken={(raw) => {
            void handleScan(raw);
          }}
        />
      )}
      {scanMutation.isPending ? (
        <p className="text-sm text-ink-secondary">{t('scanning')}</p>
      ) : null}
      <CheckinRecentList items={recentQuery.data?.data ?? []} />
    </div>
  );
};

type EventHeaderProps = {
  event: ActiveEventResponse;
  locale: string;
};

const EventHeader = ({ event, locale }: EventHeaderProps) => {
  const t = useTranslations('Checkin');
  const dates = formatEventDateRange(event.startDate, event.endDate, locale);

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
        {t('activeEvent')}
      </p>
      <h1 className="text-page-title text-ink">{event.name}</h1>
      {dates ? (
        <p className="text-sm text-ink-secondary">{dates}</p>
      ) : (
        <p className="text-sm text-ink-secondary">{event.code}</p>
      )}
    </div>
  );
};
