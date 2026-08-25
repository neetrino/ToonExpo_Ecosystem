'use client';

import type { BankPartnerOfferTemplateItem } from '@toonexpo/contracts';
import { FileStack, SquarePen, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { cn } from '@/shared/ui/cn';
import { IconButton } from '@/shared/ui/icon-button';
import { LIST_CARD_LIFT_CLASS, ListTableReveal } from '@/shared/ui/motion';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

const CARD_RADIUS_CLASS = 'rounded-[15px]';
const MEDIA_RADIUS_CLASS = 'rounded-[14px]';
/** Same landscape media ratio as partner cards. */
const MEDIA_ASPECT_CLASS = 'aspect-[16/10]';
/** Four cards per row on wide screens. */
const TEMPLATES_CARD_GRID_CLASS = 'xl:grid-cols-4';

type TemplatesCollectionProps = {
  templates: BankPartnerOfferTemplateItem[];
  viewMode: ViewMode;
  busy: boolean;
  onEdit: (template: BankPartnerOfferTemplateItem) => void;
  onDelete: (template: BankPartnerOfferTemplateItem) => void;
};

type TemplateCardProps = {
  template: BankPartnerOfferTemplateItem;
  onEdit: () => void;
};

/**
 * Finance template card — partner-style proportions; click opens edit sheet.
 */
const TemplateCard = ({ template, onEdit }: TemplateCardProps) => {
  const t = useTranslations('Admin.templates');

  return (
    <button
      type="button"
      onClick={onEdit}
      className={cn(
        'group flex h-full w-full flex-col gap-3 overflow-hidden border border-border/80',
        'bg-surface-elevated p-3.5 text-left shadow-card',
        'transition-[box-shadow,border-color] duration-[var(--duration-fast)]',
        'hover:border-brand/30 hover:shadow-sm',
        LIST_CARD_LIFT_CLASS,
        CARD_RADIUS_CLASS,
      )}
    >
      <header className="flex flex-col gap-1">
        <p className="text-[11px] font-semibold tracking-wide text-brand-deep/70 uppercase">
          {t('card.eyebrow')}
        </p>
        <h3 className="line-clamp-2 text-base font-semibold tracking-tight text-ink">
          {template.name}
        </h3>
      </header>

      <div
        className={cn(
          'relative flex w-full items-center justify-center overflow-hidden',
          'bg-band-mist/70 ring-1 ring-border/60',
          MEDIA_ASPECT_CLASS,
          MEDIA_RADIUS_CLASS,
        )}
      >
        <span
          className={cn(
            'absolute inset-y-0 left-0 w-1/2 bg-brand-soft/50',
            'transition-opacity duration-[var(--duration-fast)]',
            'group-hover:opacity-80',
          )}
          aria-hidden
        />
        <span
          className={cn(
            'relative flex size-12 items-center justify-center rounded-[14px]',
            'bg-surface-elevated text-brand-deep shadow-xs ring-1 ring-border/60',
            'transition-transform duration-[var(--duration-slow)]',
            'ease-[var(--ease-out-premium)] group-hover:scale-[1.06]',
            'motion-reduce:transition-none motion-reduce:group-hover:scale-100',
          )}
        >
          <FileStack className="size-5" strokeWidth={1.75} aria-hidden />
        </span>
      </div>

      <p className="line-clamp-2 text-sm leading-relaxed text-ink-secondary">{t('card.hint')}</p>
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
      <AdminListCardGrid className={TEMPLATES_CARD_GRID_CLASS}>
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onEdit={() => onEdit(template)}
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
