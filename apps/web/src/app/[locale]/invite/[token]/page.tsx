import { getTranslations, setRequestLocale } from 'next-intl/server';

import { SetPasswordForm } from '@/components/auth/set-password-form';
import { previewInviteWithApi } from '@/lib/auth/api-auth';

type InvitePageProps = {
  params: Promise<{ locale: string; token: string }>;
};

/**
 * Public set-password page for provisioned accounts. The token is only
 * previewed (validity + expiry check) here — it is consumed on submit.
 */
export default async function InvitePage({ params }: InvitePageProps) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('auth.invite');

  const valid = await isInviteValid(token);
  if (!valid) {
    return (
      <section className="mx-auto flex max-w-md flex-col gap-4 px-6 py-16">
        <div className="rounded-[var(--te-radius)] border border-[var(--te-border)] bg-[var(--te-card)] p-6 shadow-[var(--te-shadow-soft)]">
          <h1 className="text-2xl font-semibold text-[var(--te-fg)]">{t('invalidTitle')}</h1>
          <p className="mt-2 text-sm text-[var(--te-muted)]">{t('errors.invalidOrExpired')}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
      <div className="rounded-[var(--te-radius)] border border-[var(--te-border)] bg-[var(--te-card)] p-6 shadow-[var(--te-shadow-soft)]">
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-[var(--te-fg)]">{t('title')}</h1>
          <p className="text-sm text-[var(--te-muted)]">{t('subtitle')}</p>
        </div>
        <SetPasswordForm locale={locale} token={token} />
      </div>
    </section>
  );
}

async function isInviteValid(token: string): Promise<boolean> {
  try {
    await previewInviteWithApi(token);
    return true;
  } catch {
    return false;
  }
}
