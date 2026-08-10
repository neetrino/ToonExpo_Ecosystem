'use client';

import type { AdminPartnerListItem } from '@toonexpo/contracts';
import { Handshake } from 'lucide-react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

import {
  FeaturedBadge,
  PartnerStatusBadge,
  PublicationStatusBadge,
} from '@/features/partners/components/partner-badges';
import { PartnerTypeLabel } from '@/features/partners/components/partner-type-label';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { AdminListCardLogo } from '@/shared/ui/admin-list-card-logo';
import { cn } from '@/shared/ui/cn';
import { LIST_CARD_LIFT_CLASS, ListTableReveal } from '@/shared/ui/motion';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

const CARD_RADIUS_CLASS = 'rounded-[15px]';
const MEDIA_RADIUS_CLASS = 'rounded-[14px]';
const MEDIA_ASPECT_CLASS = 'aspect-[16/10]';

type PartnersTableProps = {
  partners: AdminPartnerListItem[];
  onSelectPartner: (partnerId: string) => void;
  viewMode?: ViewMode | undefined;
};

const formatDate = (iso: string, locale: string): string => {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
};

type PartnerCardProps = {
  partner: AdminPartnerListItem;
  onSelect: () => void;
};

/**
 * Partner collection card — cover (or logo) media + type/status chrome.
 */
const PartnerCard = ({ partner, onSelect }: PartnerCardProps) => {
  const initials = partner.name.trim().slice(0, 2).toUpperCase() || '—';
  const coverUrl = partner.coverUrl ?? partner.logoUrl;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex h-full w-full flex-col gap-3 overflow-hidden border border-border/80',
        'bg-surface-elevated p-3.5 text-left shadow-card',
        LIST_CARD_LIFT_CLASS,
        CARD_RADIUS_CLASS,
      )}
    >
      <header className="flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-surface ring-1 ring-border">
              {partner.logoUrl ? (
                <Image src={partner.logoUrl} alt="" fill className="object-cover" sizes="32px" />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-ink-muted">
                  {initials}
                </span>
              )}
            </div>
            <p className="min-w-0 truncate text-sm font-medium text-ink-secondary">
              <PartnerTypeLabel type={partner.type} />
            </p>
          </div>
          <div className="shrink-0">
            <PartnerStatusBadge status={partner.status} />
          </div>
        </div>
        <h2 className="truncate text-base font-semibold tracking-tight text-ink">{partner.name}</h2>
      </header>

      <div
        className={cn(
          'relative w-full overflow-hidden bg-surface ring-1 ring-border/60',
          MEDIA_ASPECT_CLASS,
          MEDIA_RADIUS_CLASS,
        )}
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
          />
        ) : (
          <span className="flex size-full flex-col items-center justify-center gap-1.5 text-ink-muted">
            <Handshake className="size-8 opacity-40" aria-hidden />
            <span className="max-w-[80%] truncate text-xs">{partner.name}</span>
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <FeaturedBadge featured={partner.featured} />
        <PublicationStatusBadge status={partner.publicationStatus} />
      </div>
    </button>
  );
};

/**
 * Partners collection as dense table or card grid for platform admin.
 */
export const PartnersTable = ({
  partners,
  onSelectPartner,
  viewMode = VIEW_MODE_CARDS,
}: PartnersTableProps) => {
  const t = useTranslations('Admin.partners');
  const locale = useLocale();

  if (viewMode === VIEW_MODE_CARDS) {
    return (
      <AdminListCardGrid className="gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {partners.map((partner) => (
          <PartnerCard
            key={partner.id}
            partner={partner}
            onSelect={() => {
              onSelectPartner(partner.id);
            }}
          />
        ))}
      </AdminListCardGrid>
    );
  }

  return (
    <ListTableReveal>
      <div className="overflow-x-auto rounded-sm border border-border">
        <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-3 py-2 text-left font-medium">{t('columns.name')}</th>
              <th className="px-3 py-2 text-center font-medium">{t('columns.type')}</th>
              <th className="px-3 py-2 text-center font-medium">{t('columns.status')}</th>
              <th className="px-3 py-2 text-center font-medium">{t('columns.publication')}</th>
              <th className="px-3 py-2 text-center font-medium">{t('columns.updatedAt')}</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((partner) => (
              <tr key={partner.id} className="border-t border-border hover:bg-surface/60">
                <td className="px-3 py-2.5 text-left">
                  <div className="flex items-center gap-3">
                    <AdminListCardLogo
                      name={partner.name}
                      logoUrl={partner.logoUrl}
                      shape="circle"
                    />
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className="font-medium text-brand hover:underline"
                        onClick={() => {
                          onSelectPartner(partner.id);
                        }}
                      >
                        {partner.name}
                      </button>
                      <FeaturedBadge featured={partner.featured} />
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-center text-ink-secondary">
                  <PartnerTypeLabel type={partner.type} />
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex justify-center">
                    <PartnerStatusBadge status={partner.status} />
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex justify-center">
                    <PublicationStatusBadge status={partner.publicationStatus} />
                  </div>
                </td>
                <td className="px-3 py-2.5 text-center text-ink-secondary">
                  {formatDate(partner.updatedAt, locale)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ListTableReveal>
  );
};
