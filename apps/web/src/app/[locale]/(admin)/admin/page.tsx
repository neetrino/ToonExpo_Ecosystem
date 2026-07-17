import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ProvisionForm } from '@/components/admin/provision-form';
import { UsersTable } from '@/components/admin/users-table';
import { loadPartnerOptions, loadProvisionedUsers } from '@/lib/admin/queries';

import { provisionAccountAction } from './actions';

type AdminPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, users, partners] = await Promise.all([
    getTranslations('admin'),
    loadProvisionedUsers(),
    loadPartnerOptions(),
  ]);

  return (
    <section className="portal-section">
      <header className="portal-section__header">
        <div>
          <h2 className="portal-page__title">{t('provision.title')}</h2>
          <p className="portal-muted">{t('provision.description')}</p>
        </div>
      </header>

      <ProvisionForm action={provisionAccountAction.bind(null, locale)} partners={partners} />
      <UsersTable users={users} locale={locale} />
    </section>
  );
}
