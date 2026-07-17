import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { auth } from '@/auth';
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

type QrScanPageProps = {
  params: Promise<{ locale: string; token: string }>;
};

type QrMessages = Awaited<ReturnType<typeof getTranslations>>;

/**
 * Public QR resolve route — role-branched:
 * owner → account; BUILDER → CRM scan; ENTRANCE_STAFF → check-in; else limited.
 */
export default async function QrScanPage({ params }: QrScanPageProps) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('qr');

  const session = await auth();
  const builder = session?.user?.role === 'BUILDER' ? await assertBuilderSession() : null;
  const resolved = await resolveQrScan(token, {
    userId: session?.user?.id,
    role: session?.user?.role,
    companyId: builder?.companyId,
  });

  if (resolved.kind === 'owner') {
    redirect(`/${locale}/account#my-qr`);
  }
  if (resolved.kind === 'builder' && builder) {
    return renderBuilderAction(locale, token, resolved, builder, t);
  }
  if (resolved.kind === 'entrance' && session?.user?.role === 'ENTRANCE_STAFF') {
    return renderEntranceAction(locale, token, resolved, t);
  }

  return <QrStatusView title={t('public.title')} body={t('public.body')} />;
}

async function renderBuilderAction(
  locale: string,
  token: string,
  resolved: QrResolveBuilder,
  builder: BuilderSessionContext,
  t: QrMessages,
) {
  await logBuilderQrScan({
    qrCodeId: resolved.qrCodeId,
    scannedByUserId: builder.session.user.id,
    companyId: builder.companyId,
  });

  return (
    <section className="qr-page">
      <header className="qr-page__header">
        <h1 className="qr-page__title">{t('builder.title')}</h1>
        <p className="qr-page__subtitle">{t('builder.subtitle')}</p>
      </header>
      <BuilderScanForm
        locale={locale}
        qrToken={token}
        buyerName={resolved.buyer.name?.trim() || resolved.buyer.email}
        buyerEmail={resolved.buyer.email}
        buyerPhone={resolved.buyer.phone?.trim() || t('builder.noPhone')}
        projects={resolved.projects}
      />
    </section>
  );
}

async function renderEntranceAction(
  locale: string,
  token: string,
  resolved: QrResolveEntrance,
  t: QrMessages,
) {
  const event = await loadActiveExhibitionEvent();
  const displayName = resolved.buyer.name?.trim() || t('entrance.unnamedVisitor');

  return (
    <section className="qr-page">
      <header className="qr-page__header">
        <h1 className="qr-page__title">{t('entrance.title')}</h1>
        <p className="qr-page__subtitle">{t('entrance.subtitle')}</p>
      </header>
      <EntranceCheckInForm
        locale={locale}
        qrToken={token}
        eventId={event?.id ?? null}
        buyerName={displayName}
      />
    </section>
  );
}

function QrStatusView({ title, body }: { title: string; body: string }) {
  return (
    <section className="qr-page">
      <header className="qr-page__header">
        <h1 className="qr-page__title">{title}</h1>
        <p className="qr-page__subtitle">{body}</p>
      </header>
    </section>
  );
}
