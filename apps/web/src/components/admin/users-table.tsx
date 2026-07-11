import type { PlatformRole } from '@toonexpo/domain';
import { getTranslations } from 'next-intl/server';

export type ProvisionedUserRow = {
  id: string;
  email: string;
  name: string | null;
  role: PlatformRole;
  companyName: string | null;
  createdAt: Date;
};

type UsersTableProps = {
  users: ProvisionedUserRow[];
  locale: string;
};

export async function UsersTable({ users, locale }: UsersTableProps) {
  const t = await getTranslations('admin.users');
  const tRoles = await getTranslations('admin.users.roles');
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-medium">{t('title')}</h2>
      {users.length === 0 ? (
        <p className="text-sm text-[var(--te-muted)]">{t('empty')}</p>
      ) : (
        <div className="overflow-x-auto rounded border border-white/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-white/10 text-[var(--te-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">{t('columns.email')}</th>
                <th className="px-4 py-3 font-medium">{t('columns.name')}</th>
                <th className="px-4 py-3 font-medium">{t('columns.role')}</th>
                <th className="px-4 py-3 font-medium">{t('columns.company')}</th>
                <th className="px-4 py-3 font-medium">{t('columns.createdAt')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.name ?? t('noName')}</td>
                  <td className="px-4 py-3">{tRoles(user.role)}</td>
                  <td className="px-4 py-3">{user.companyName ?? t('noCompany')}</td>
                  <td className="px-4 py-3">{dateFormatter.format(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
