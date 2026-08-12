import type { LucideIcon } from 'lucide-react';
import { Building2, Globe, Images, Mail, Megaphone, Phone, UserRound } from 'lucide-react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { staticAssetUrl } from '@/shared/lib/static-asset-url';
import { cn } from '@/shared/ui/cn';

export type BuilderContactLinkKind =
  | 'website'
  | 'instagram'
  | 'facebook'
  | 'mediaMaterials'
  | 'advertisingMaterials';

export type BuilderContactLink = {
  kind: BuilderContactLinkKind;
  label: string;
  href: string;
};

const LINK_LUCIDE_ICON: Partial<Record<BuilderContactLinkKind, LucideIcon>> = {
  website: Globe,
  mediaMaterials: Images,
  advertisingMaterials: Megaphone,
};

const SOCIAL_ICON_SRC: Partial<Record<BuilderContactLinkKind, string>> = {
  facebook: staticAssetUrl('/images/social/facebook.webp'),
  instagram: staticAssetUrl('/images/social/instagram.webp'),
};

type BuilderContactsCardProps = {
  phone?: string | null | undefined;
  email?: string | null | undefined;
  contactPerson?: string | null | undefined;
  projectCount?: number | undefined;
  catalogHref?: string | undefined;
  links?: readonly BuilderContactLink[] | undefined;
  className?: string | undefined;
};

/**
 * Sticky contacts card for builder / developer detail pages.
 */
export const BuilderContactsCard = async ({
  phone,
  email,
  contactPerson,
  projectCount,
  catalogHref,
  links = [],
  className,
}: BuilderContactsCardProps) => {
  const t = await getTranslations('Catalog.buildersPage.detail');
  const phoneHref =
    phone != null && phone.trim().length > 0 ? `tel:+${phone.replace(/\s+/g, '')}` : null;

  return (
    <aside
      className={cn('rounded-[20px] bg-surface-elevated p-6 ring-1 ring-header-border', className)}
    >
      <h2 className="font-brand text-lg font-semibold text-ink-navy">{t('contactsTitle')}</h2>
      <dl className="mt-4 flex flex-col gap-4 text-sm">
        {phone ? (
          <FactRow icon={Phone} label={t('phone')} value={phone} href={phoneHref ?? undefined} />
        ) : null}
        {email ? (
          <FactRow icon={Mail} label={t('email')} value={email} href={`mailto:${email}`} />
        ) : null}
        {contactPerson ? (
          <FactRow icon={UserRound} label={t('contactPerson')} value={contactPerson} />
        ) : null}
        {projectCount != null ? (
          <FactRow icon={Building2} label={t('projectCount')} value={String(projectCount)} />
        ) : null}
      </dl>

      {catalogHref ? (
        <Link
          href={catalogHref}
          className={cn(
            'mt-5 inline-flex h-11 w-full items-center justify-center rounded-sm px-5 text-sm font-medium',
            'bg-brand text-on-brand transition-colors hover:bg-brand-hover',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
          )}
        >
          {t('catalogLink')}
        </Link>
      ) : null}

      {links.length > 0 ? (
        <ul className="mt-5 flex flex-col gap-2 border-t border-header-border pt-5 text-sm">
          {links.map((row) => (
            <li key={row.kind}>
              <a
                href={row.href}
                className="inline-flex items-center gap-2 font-medium text-brand-deep transition-colors hover:text-brand"
                rel="noopener noreferrer"
                target="_blank"
              >
                <ContactLinkIcon kind={row.kind} />
                {row.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </aside>
  );
};

const ContactLinkIcon = ({ kind }: { kind: BuilderContactLinkKind }) => {
  const socialSrc = SOCIAL_ICON_SRC[kind];
  const LucideGlyph = LINK_LUCIDE_ICON[kind];

  if (socialSrc) {
    return (
      <Image
        src={socialSrc}
        alt=""
        width={16}
        height={16}
        className="size-4 shrink-0 object-contain"
      />
    );
  }

  if (LucideGlyph) {
    return <LucideGlyph className="size-4 shrink-0" strokeWidth={2} aria-hidden />;
  }

  return null;
};

const FactRow = ({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string | undefined;
}) => (
  <div className="flex gap-2.5">
    <Icon className="mt-0.5 size-4 shrink-0 text-brand-deep" strokeWidth={2} aria-hidden />
    <div className="flex min-w-0 flex-col gap-0.5">
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
  </div>
);
