import { setRequestLocale } from 'next-intl/server';

import { QrLandingContent } from '@/features/buyer/components/qr-landing-content';

type QrLandingPageProps = {
  params: Promise<{ locale: string; token: string }>;
};

/**
 * Public QR scan landing — `{APP_URL}/qr/{token}` (locale-prefixed by next-intl).
 */
export default async function QrLandingPage({ params }: QrLandingPageProps) {
  const { locale, token } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-10 sm:px-6">
        <QrLandingContent token={token} />
      </main>
    </div>
  );
}
