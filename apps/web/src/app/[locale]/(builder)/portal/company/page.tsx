import { PLATFORM_ROLES } from '@toonexpo/domain';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import { loadCompanyMembers, loadCompanyProfile } from '@/lib/builder/company-queries';

import { CompanyProfileSection } from './company-profile-section';
import { CompanyTeamSection } from './company-team-section';

type PortalCompanyPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PortalCompanyPage({ params }: PortalCompanyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const builderContext = await assertBuilderSession();
  if (!builderContext) {
    return null;
  }

  const [t, tRoles, profile, members] = await Promise.all([
    getTranslations('portal.company'),
    getTranslations('portal.company.roles'),
    loadCompanyProfile(builderContext.companyId),
    loadCompanyMembers(builderContext.companyId),
  ]);

  if (!profile) {
    return (
      <section>
        <h2 className="portal-page__title">{t('title')}</h2>
        <p className="portal-empty">{t('profileMissing')}</p>
      </section>
    );
  }

  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });
  const roleLabels = Object.fromEntries(
    PLATFORM_ROLES.map((role) => [role, tRoles(role)]),
  ) as Record<(typeof PLATFORM_ROLES)[number], string>;

  return (
    <section>
      <div className="portal-page__header">
        <div>
          <h2 className="portal-page__title">{t('title')}</h2>
          <p className="portal-page__subtitle">{t('subtitle')}</p>
        </div>
      </div>

      <CompanyProfileSection
        locale={locale}
        profile={profile}
        labels={{
          title: t('profileTitle'),
          edit: t('editProfile'),
          description: t('fields.description'),
          phone: t('fields.phone'),
          email: t('fields.email'),
          website: t('fields.website'),
          location: t('fields.location'),
          noValue: t('noValue'),
        }}
      />

      <CompanyTeamSection
        members={members}
        labels={{
          title: t('teamTitle'),
          empty: t('teamEmpty'),
          columns: {
            name: t('columns.name'),
            email: t('columns.email'),
            role: t('columns.role'),
            joinedAt: t('columns.joinedAt'),
          },
          roles: roleLabels,
        }}
        formatDate={(date) => dateFormatter.format(date)}
      />
    </section>
  );
}
