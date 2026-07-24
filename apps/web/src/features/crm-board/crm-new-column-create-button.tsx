'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/shared/ui/cn';

type CrmNewColumnCreateButtonProps = {
  onClick: () => void;
};

/**
 * Dashed + Quick Lead control for the Kanban New column.
 */
export const CrmNewColumnCreateButton = ({ onClick }: CrmNewColumnCreateButtonProps) => {
  const t = useTranslations('CrmBoard');

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-center gap-1.5 rounded-sm border border-dashed border-border',
        'bg-background px-3 py-2.5 text-sm font-medium text-ink-secondary',
        'transition-colors hover:border-brand hover:bg-brand/5 hover:text-brand',
      )}
    >
      <Plus className="size-4 shrink-0" aria-hidden />
      {t('quickLead')}
    </button>
  );
};
