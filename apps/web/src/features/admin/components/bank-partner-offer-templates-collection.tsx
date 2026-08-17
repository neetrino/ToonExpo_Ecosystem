'use client';

import type { BankPartnerOfferTemplateItem } from '@toonexpo/contracts';
import { FileStack, SquarePen, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
 * Generic finance template card — name + actions (no bank branding).
 */
const TemplateCard = ({ template, busy, onEdit, onDelete }: TemplateCardProps) => {
  const t = useTranslations('Admin.templates');

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
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-ink-secondary ring-1 ring-border/60">
            <FileStack className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-base font-semibold tracking-tight text-ink-navy">
              {template.name}
            </h3>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-ink-muted">{t('card.hint')}</p>
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
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead className="bg-surface-muted text-xs tracking-wide text-ink-muted uppercase">
            <tr>
              <th className="px-4 py-3 font-semibold">{t('columns.name')}</th>
              <th className="px-4 py-3 font-semibold">{t('columns.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((template) => (
              <tr key={template.id} className="border-t border-border">
                <td className="max-w-[20rem] px-4 py-3 font-medium text-ink-navy">
                  <span className="line-clamp-2">{template.name}</span>
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
