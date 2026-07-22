'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { QrResolveResponse } from '@toonexpo/contracts';

import { BuyerActionCard } from '@/features/buyer/components/buyer-action-card';
import { resolveQrToken } from '@/features/buyer/api/qr-resolve-api';
import { Link, useRouter } from '@/i18n/navigation';
import { Card } from '@/shared/ui/card';

type QrLandingContentProps = {
  token: string;
};

type ResolveState =
  { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: QrResolveResponse };

/**
 * Client flow for /qr/[token]: resolve → role-specific UI.
 */
export const QrLandingContent = ({ token }: QrLandingContentProps) => {
  const t = useTranslations('QrLanding');
  const router = useRouter();
  const [state, setState] = useState<ResolveState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const data = await resolveQrToken({ token });
        if (cancelled) {
          return;
        }
        if (data.kind === 'owner_profile') {
          router.replace('/qr');
        }
        setState({ status: 'ready', data });
      } catch {
        if (!cancelled) {
          setState({ status: 'error' });
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [token, router]);

  if (state.status === 'loading') {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (state.status === 'error') {
    return (
      <Card className="flex flex-col gap-4 text-center">
        <h1 className="text-xl font-semibold text-ink">{t('denied.title')}</h1>
        <p className="text-sm text-ink-secondary">{t('denied.description')}</p>
        <Link
          href={`/auth/login?returnUrl=${encodeURIComponent(`/qr/${token}`)}`}
          className="text-sm font-semibold text-brand hover:underline"
        >
          {t('denied.login')}
        </Link>
      </Card>
    );
  }

  const { data } = state;

  if (data.kind === 'owner_profile') {
    return <p className="text-sm text-ink-secondary">{t('redirecting')}</p>;
  }

  if (data.kind === 'entrance_checkin') {
    return (
      <Card className="flex flex-col gap-3 text-center">
        <h1 className="text-xl font-semibold text-ink">{t('checkin.title')}</h1>
        <p className="text-sm text-ink-secondary">{t('checkin.description')}</p>
        <p className="text-sm font-medium text-ink">{data.name}</p>
      </Card>
    );
  }

  if (data.kind === 'buyer_action') {
    return <BuyerActionCard payload={data} />;
  }

  return (
    <Card className="text-center">
      <p className="text-sm text-ink-secondary">{t('denied.description')}</p>
    </Card>
  );
};
