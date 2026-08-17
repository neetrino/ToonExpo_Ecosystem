'use client';

import type { BankPartnerOfferTemplateItem, PublicationStatus } from '@toonexpo/contracts';
import { FileStack, SquarePen, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { IconButton } from '@/shared/ui/icon-button';
import { LIST_CARD_LIFT_CLASS, ListTableReveal } from '@/shared/ui/motion';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';
import { cn } from '@/shared/ui/cn';

type TemplatesCollectionProps = {
  templates: BankPartnerOfferTemplateItem[];
  viewMode: ViewMode;
  busy: boolean;
  onEdit: (template: BankPartnerOfferTemplateItem) => void;
  onDelete: (template: BankPartnerOfferTemplateItem) => void;
};

const STATUS_BADGE_CLASS: Record<PublicationStatus, string> = {
  published: 'bg-success-soft text-success',
  draft: 'bg-surface text-ink-muted',
  archived: 'bg-warning-soft text-warning',
};

type TemplateCardProps = {
  template: BankPartnerOfferTemplateItem;
  onEdit: () => void;
};

const TemplateCard = ({ template, onEdit }: TemplateCardProps) => {
  const t = useTranslations('Admin.templates');
  return (
    <button
      type="button"
      onClick={onEdit}
      className={cn(
        'flex w-full flex-col gap-3 rounded-2xl border border-border bg-surface p-4 text-left',
        LIST_CARD_LIFT_CLASS,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-ink-secondary">
          <FileStack className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink-navy">{template.name}</p>
          <p className="truncate text-sm text-ink-secondary">{template.partnerCompanyName}</p>
        </div>
        <PublicationStatusBadge
          status={template.publicationStatus}
          className={STATUS_BADGE_CLASS[template.publicationStatus]}
        />
      </div>
      <p className="text-xs text-ink-muted">{t('card.hint')}</p>
    </button>
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
          <div key={template.id} className="relative">
            <TemplateCard template={template} onEdit={() => onEdit(template)} />
            <div className="absolute top-3 right-3 flex gap-1">
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
          </div>
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
                <td className="px-4 py-3 font-medium text-ink-navy">{template.name}</td>
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
