import type { PublicPartnerDetail } from '@toonexpo/contracts';
import { getTranslations } from 'next-intl/server';

import { cn } from '@/shared/ui/cn';

type PartnerDetailContentProps = {
  partner: PublicPartnerDetail;
};

/**
 * Partner body: description, offers, and contact sidebar.
 */
export const PartnerDetailContent = async ({ partner }: PartnerDetailContentProps) => {
  const t = await getTranslations('Catalog.partnersPage');
  const socialEntries = partner.socialLinks ? Object.entries(partner.socialLinks) : [];
  const hasContacts =
    Boolean(partner.contacts?.phone) ||
    Boolean(partner.contacts?.email) ||
    Boolean(partner.website) ||
    socialEntries.length > 0;

  return (
    <div
      className={cn(
        'page-container grid gap-10 pb-16 pt-6',
        hasContacts && 'lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start xl:gap-14',
      )}
    >
      <section className="flex min-w-0 flex-col gap-8">
        {partner.fullDescription ? (
          <div className="whitespace-pre-wrap text-base leading-relaxed text-ink-navy">
            {partner.fullDescription}
          </div>
        ) : null}

        {partner.offers.length > 0 ? (
          <section className="flex flex-col gap-4">
            <h2 className="font-brand text-2xl font-bold tracking-[-0.02em] text-ink-navy">
              {t('detail.offersTitle')}
            </h2>
            <ul className="flex flex-col gap-3">
              {partner.offers.map((offer) => (
                <li
                  key={offer.id}
                  className="rounded-[20px] bg-surface-elevated p-5 ring-1 ring-header-border"
                >
                  <h3 className="font-brand text-base font-semibold text-ink-navy">
                    {offer.title}
                  </h3>
                  {offer.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-header-muted">
                      {offer.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </section>

      {hasContacts ? (
        <aside className="rounded-[20px] bg-surface-elevated p-6 ring-1 ring-header-border">
          <h2 className="font-brand text-lg font-semibold text-ink-navy">
            {t('detail.contactsTitle')}
          </h2>
          <dl className="mt-4 flex flex-col gap-3 text-sm">
            {partner.contacts?.phone ? (
              <ContactRow label={t('detail.phone')} value={partner.contacts.phone} />
            ) : null}
            {partner.contacts?.email ? (
              <ContactRow
                label={t('detail.email')}
                value={partner.contacts.email}
                href={`mailto:${partner.contacts.email}`}
              />
            ) : null}
            {partner.website ? (
              <ContactRow
                label={t('detail.website')}
                value={partner.website}
                href={partner.website}
              />
            ) : null}
          </dl>
          {socialEntries.length > 0 ? (
            <ul className="mt-5 flex flex-col gap-2 border-t border-header-border pt-4 text-sm">
              {socialEntries.map(([key, url]) => (
                <li key={key}>
                  <a
                    href={url}
                    className="font-medium text-brand-deep transition-colors hover:text-brand"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {key}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </aside>
      ) : null}
    </div>
  );
};

const ContactRow = ({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string | undefined;
}) => (
  <div className="flex flex-col gap-0.5">
    <dt className="text-[10px] font-bold tracking-widest text-header-muted uppercase">{label}</dt>
    <dd className="text-ink-navy">
      {href ? (
        <a
          href={href}
          className="font-medium text-brand-deep transition-colors hover:text-brand"
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          target={href.startsWith('http') ? '_blank' : undefined}
        >
          {value}
        </a>
      ) : (
        value
      )}
    </dd>
  </div>
);
