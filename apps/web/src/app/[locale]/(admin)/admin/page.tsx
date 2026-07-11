import { prisma } from '@toonexpo/db';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ProvisionForm } from '@/components/admin/provision-form';
import { UsersTable, type ProvisionedUserRow } from '@/components/admin/users-table';

import { provisionAccountAction } from './actions';

type AdminPageProps = {
  params: Promise<{ locale: string }>;
};

async function loadProvisionedUsers(): Promise<ProvisionedUserRow[]> {
  const users = await prisma.user.findMany({
    where: { role: { not: 'BUYER' } },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      members: {
        select: { company: { select: { name: true } } },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyName: user.members[0]?.company.name ?? null,
    createdAt: user.createdAt,
  }));
}

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');
  const users = await loadProvisionedUsers();

  return (
    <section className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h2 className="portal-page__title">{t('provision.title')}</h2>
        <p className="text-[var(--te-muted)]">{t('provision.description')}</p>
      </header>

      <ProvisionForm action={provisionAccountAction.bind(null, locale)} />
      <UsersTable users={users} locale={locale} />
    </section>
  );
}
