'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

import { getSession } from '@/lib/auth/get-session';
import {
  assertBuilderSession,
  type BuilderSessionContext,
} from '@/lib/builder/assert-builder-session';
import { loadActiveExhibitionEvent } from '@/lib/exhibition/queries';
import type { QrResolveBuilder, QrResolveEntrance } from '@/lib/qr/resolve';
import { resolveQrScan } from '@/lib/qr/resolve';
import { logBuilderQrScan } from '@/lib/qr/scan-deal-mutations';

import { BuilderScanForm } from '../builder-scan-form';
import { EntranceCheckInForm } from '../entrance-check-in-form';

type QrScanClientProps = {
  token: string;
};

type LoadedScan =
  | { kind: 'public' }
  | { kind: 'builder'; resolved: QrResolveBuilder; builder: BuilderSessionContext }
  | { kind: 'entrance'; resolved: QrResolveEntrance; eventId: string | null };

export function QrScanClient({ token }: QrScanClientProps) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('qr');
  const [loaded, setLoaded] = useState<LoadedScan | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const session = await getSession();
      const builder =
        session?.user?.role === 'BUILDER' ? await assertBuilderSession() : null;
      if (cancelled) {
        return;
      }

      const resolved = await resolveQrScan(token, {
        userId: session?.user?.id,
        role: session?.user?.role,
        companyId: builder?.companyId,
      });
      if (cancelled) {
        return;
      }

      if (resolved.kind === 'owner') {
        router.replace(`/${locale}/account#my-qr`);
        return;
      }

      if (resolved.kind === 'builder' && builder) {
        await logBuilderQrScan({
          qrCodeId: resolved.qrCodeId,
          scannedByUserId: builder.session.user.id,
          companyId: builder.companyId,
        });
        if (cancelled) {
          return;
        }
        setLoaded({ kind: 'builder', resolved, builder });
        return;
      }

      if (resolved.kind === 'entrance' && session?.user?.role === 'ENTRANCE_STAFF') {
        const event = await loadActiveExhibitionEvent();
        if (cancelled) {
          return;
        }
        setLoaded({ kind: 'entrance', resolved, eventId: event?.id ?? null });
        return;
      }

      setLoaded({ kind: 'public' });
    })();
    return () => {
      cancelled = true;
    };
  }, [token, locale, router]);

  if (!loaded) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-[var(--te-muted)]" role="status">
        Loading…
      </div>
    );
  }

  if (loaded.kind === 'builder') {
    const { resolved } = loaded;
    return (
      <QrPageShell title={t('builder.title')} subtitle={t('builder.subtitle')}>
        <BuilderScanForm
          locale={locale}
          qrToken={token}
          buyerName={resolved.buyer.name?.trim() || resolved.buyer.email}
          buyerEmail={resolved.buyer.email}
          buyerPhone={resolved.buyer.phone?.trim() || t('builder.noPhone')}
          projects={resolved.projects}
        />
      </QrPageShell>
    );
  }

  if (loaded.kind === 'entrance') {
    const displayName = loaded.resolved.buyer.name?.trim() || t('entrance.unnamedVisitor');
    return (
      <QrPageShell title={t('entrance.title')} subtitle={t('entrance.subtitle')}>
        <EntranceCheckInForm
          locale={locale}
          qrToken={token}
          eventId={loaded.eventId}
          buyerName={displayName}
        />
      </QrPageShell>
    );
  }

  return <QrPageShell title={t('public.title')} subtitle={t('public.body')} />;
}

function QrPageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <section className="qr-page">
      <header className="qr-page__header">
        <h1 className="qr-page__title">{title}</h1>
        <p className="qr-page__subtitle">{subtitle}</p>
      </header>
      {children}
    </section>
  );
}
