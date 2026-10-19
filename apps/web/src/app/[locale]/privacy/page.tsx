import type { Metadata } from 'next';
import { isSupportedLocale } from '@toonexpo/shared';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { SiteFooter } from '@/features/catalog/components/site-footer';
import { getPrivacyPolicy } from '@/features/legal/privacy-policy';
import { PrivacyPolicyPage } from '@/features/legal/privacy-policy-page';

type PrivacyPageProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async ({ params }: PrivacyPageProps): Promise<Metadata> => {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    return { title: 'Privacy Policy' };
  }

  const copy = getPrivacyPolicy(locale);
  return {
    title: copy.title,
    description: copy.intro[0],
  };
};

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const copy = getPrivacyPolicy(locale);

  return (
    <div className="min-h-screen bg-canvas">
      <main>
        <PrivacyPolicyPage copy={copy} />
      </main>
      <SiteFooter />
    </div>
  );
}
