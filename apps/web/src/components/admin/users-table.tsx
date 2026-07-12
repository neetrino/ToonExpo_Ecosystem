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
    <section className="portal-section">
      <h2 className="portal-section__title">{t('title')}</h2>
      {users.length === 0 ? (
        <p className="portal-empty">{t('empty')}</p>
      ) : (
        <div className="portal-table-wrap">
          <table className="portal-table">
            <thead>
              <tr>
                <th>{t('columns.email')}</th>
                <th>{t('columns.name')}</th>
                <th>{t('columns.role')}</th>
                <th>{t('columns.company')}</th>
                <th>{t('columns.createdAt')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.name ?? t('noName')}</td>
                  <td>{tRoles(user.role)}</td>
                  <td>{user.companyName ?? t('noCompany')}</td>
                  <td>{dateFormatter.format(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
