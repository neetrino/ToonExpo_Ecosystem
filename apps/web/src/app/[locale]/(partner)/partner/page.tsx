import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { assertPartnerSession } from '@/lib/partner/assert-partner-session';

type PartnerOverviewPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PartnerOverviewPage({ params }: PartnerOverviewPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const ctx = await assertPartnerSession();
  if (!ctx) {
    return null;
  }

  const [t, tTypes, tStatus] = await Promise.all([
    getTranslations('partnerCabinet.overview'),
    getTranslations('partnerCabinet.types'),
    getTranslations('partnerCabinet.status'),
  ]);

  const { partner } = ctx;
  const publicHref = `/partners/${partner.slug}`;

  return (
    <section>
      <div className="portal-page__header">
        <div>
          <h2 className="portal-page__title">{t('title')}</h2>
          <p className="portal-page__subtitle">{t('subtitle')}</p>
        </div>
      </div>

      <dl className="portal-dl">
        <div>
          <dt>{t('fields.name')}</dt>
          <dd>{partner.name}</dd>
        </div>
        <div>
          <dt>{t('fields.type')}</dt>
          <dd>{tTypes(partner.type)}</dd>
        </div>
        <div>
          <dt>{t('fields.status')}</dt>
          <dd>
            <span className={`portal-badge portal-badge--${partner.status.toLowerCase()}`}>
              {tStatus(partner.status)}
            </span>
          </dd>
        </div>
        <div>
          <dt>{t('fields.publicLink')}</dt>
          <dd>
            {partner.status === 'PUBLISHED' ? (
              <Link href={publicHref}>{t('viewPublic')}</Link>
            ) : (
              <span className="portal-muted">{t('notPublicYet')}</span>
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}
