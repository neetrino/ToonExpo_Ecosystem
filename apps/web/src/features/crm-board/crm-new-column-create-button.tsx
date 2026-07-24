'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/shared/ui/cn';

type CrmNewColumnCreateButtonProps = {
  onClick: () => void;
};

/**
 * Soft + Quick Lead control for the Kanban New column.
 */
export const CrmNewColumnCreateButton = ({ onClick }: CrmNewColumnCreateButtonProps) => {
  const t = useTranslations('CrmBoard');

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed',
        'border-brand/30 bg-brand-soft/40 px-2 py-2.5 text-[11px] font-semibold tracking-wide text-brand',
        'transition-[border-color,background-color,color,box-shadow] duration-200 ease-[var(--ease-out-premium)]',
        'hover:border-brand/55 hover:bg-brand-soft hover:text-brand-deep hover:shadow-xs',
      )}
    >
      <Plus className="size-3.5 shrink-0" aria-hidden />
      <span className="truncate">{t('quickLead')}</span>
    </button>
  );
};
