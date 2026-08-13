'use client';

import type { PortalReadinessCriterionItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ReadinessHelpDialog } from '@/features/builder/components/readiness-help-dialog';

type BuilderReadinessCriterionHelpProps = {
  item: PortalReadinessCriterionItem;
};

/**
 * "!" control — opens providers linked to this criterion's service category.
 */
export const BuilderReadinessCriterionHelp = ({ item }: BuilderReadinessCriterionHelpProps) => {
  const t = useTranslations('Builder.readiness');
  const tKpi = useTranslations('ReadinessKpi');
  const [open, setOpen] = useState(false);
  const categoryId = item.serviceProviderCategoryId;

  if (categoryId == null) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-brand/40 text-xs font-bold text-brand hover:bg-brand-soft"
        aria-label={t('criterionHelp')}
        onClick={() => {
          setOpen(true);
        }}
      >
        !
      </button>
      {open ? (
        <ReadinessHelpDialog
          categoryName={tKpi(`criteria.${item.code}`)}
          categoryId={categoryId}
          onClose={() => {
            setOpen(false);
          }}
        />
      ) : null}
    </>
  );
};
