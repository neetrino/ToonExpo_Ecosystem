'use client';

import type { BankPartnerOfferTemplateItem } from '@toonexpo/contracts';
import { FileStack, SquarePen, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { cn } from '@/shared/ui/cn';
import { IconButton } from '@/shared/ui/icon-button';
import { LIST_CARD_LIFT_CLASS, ListTableReveal } from '@/shared/ui/motion';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

type TemplatesCollectionProps = {
  templates: BankPartnerOfferTemplateItem[];
  viewMode: ViewMode;
  busy: boolean;
  onEdit: (template: BankPartnerOfferTemplateItem) => void;
  onDelete: (template: BankPartnerOfferTemplateItem) => void;
};

type TemplateCardProps = {
  template: BankPartnerOfferTemplateItem;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

/**
 * Template card — clear hierarchy: media/bank, title, status, actions (no overlap).
 */
const TemplateCard = ({ template, busy, onEdit, onDelete }: TemplateCardProps) => {
  const t = useTranslations('Admin.templates');
  const logoUrl = template.partnerCompanyLogoUrl;

  return (
    <article
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-[15px] border border-border/80',
        'bg-surface-elevated shadow-xs',
        'transition-[box-shadow,transform] duration-[var(--duration-fast)]',
        'hover:shadow-sm',
        LIST_CARD_LIFT_CLASS,
      )}
    >
      <button
        type="button"
        onClick={onEdit}
        className="flex min-w-0 flex-1 flex-col gap-4 p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-muted ring-1 ring-border/60">
            {logoUrl ? (
              <Image src={logoUrl} alt="" fill className="object-cover" sizes="44px" />
            ) : (
              <FileStack className="size-5 text-ink-secondary" aria-hidden />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-secondary">
              {template.partnerCompanyName}
            </p>
            <PublicationStatusBadge status={template.publicationStatus} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-base font-semibold tracking-tight text-ink-navy">
            {template.name}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">{t('card.hint')}</p>
        </div>
      </button>

      <div className="flex items-center justify-end gap-1 border-t border-border/70 px-3 py-2">
        <IconButton label={t('edit')} size="sm" disabled={busy} onClick={onEdit}>
          <SquarePen className="size-4" strokeWidth={1.75} aria-hidden />
        </IconButton>
        <IconButton
          label={t('delete')}
          size="sm"
          className="text-danger hover:bg-danger-soft"
          disabled={busy}
          onClick={onDelete}
        >
          <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
        </IconButton>
      </div>
    </article>
  );
};

/**
 * Admin templates list (cards + table).
 */
export const BankPartnerOfferTemplatesCollection = ({
  templates,
  viewMode,
  busy,
  onEdit,
  onDelete,
}: TemplatesCollectionProps) => {
  const t = useTranslations('Admin.templates');

  if (viewMode === VIEW_MODE_CARDS) {
    return (
      <AdminListCardGrid>
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            busy={busy}
            onEdit={() => onEdit(template)}
            onDelete={() => onDelete(template)}
          />
        ))}
      </AdminListCardGrid>
    );
  }

  return (
    <ListTableReveal>
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-surface-muted text-xs tracking-wide text-ink-muted uppercase">
            <tr>
              <th className="px-4 py-3 font-semibold">{t('columns.name')}</th>
              <th className="px-4 py-3 font-semibold">{t('columns.bank')}</th>
              <th className="px-4 py-3 font-semibold">{t('columns.publication')}</th>
              <th className="px-4 py-3 font-semibold">{t('columns.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((template) => (
              <tr key={template.id} className="border-t border-border">
                <td className="max-w-[18rem] px-4 py-3 font-medium text-ink-navy">
                  <span className="line-clamp-2">{template.name}</span>
                </td>
                <td className="px-4 py-3 text-ink-secondary">{template.partnerCompanyName}</td>
                <td className="px-4 py-3">
                  <PublicationStatusBadge status={template.publicationStatus} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <IconButton
                      label={t('edit')}
                      disabled={busy}
                      onClick={() => onEdit(template)}
                    >
                      <SquarePen className="size-4" />
                    </IconButton>
                    <IconButton
                      label={t('delete')}
                      disabled={busy}
                      onClick={() => onDelete(template)}
                    >
                      <Trash2 className="size-4" />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ListTableReveal>
  );
};
