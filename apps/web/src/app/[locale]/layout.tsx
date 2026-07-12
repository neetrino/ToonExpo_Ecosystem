import { isAppLocale, SUPPORTED_LOCALES } from '@toonexpo/shared';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { AuthNav } from '@/components/auth/auth-nav';
import { buildAppShellNavVisibility } from '@/lib/auth/nav-visibility';
import {
  loadPlatformContactSettings,
  resolveContactWithDefaults,
} from '@/lib/shared/platform-settings';

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isAppLocale(locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  const session = await auth();
  const navVisibility = buildAppShellNavVisibility(session?.user?.role);
  const tFooter = await getTranslations('footer.contact');
  const contact = resolveContactWithDefaults(await loadPlatformContactSettings(), {
    email: tFooter('emailDefault'),
    phone: tFooter('phoneDefault'),
  });

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AppShell
            authSlot={<AuthNav locale={locale} />}
            navVisibility={navVisibility}
            contactEmail={contact.email}
            contactPhone={contact.phone}
          >
            {children}
          </AppShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
