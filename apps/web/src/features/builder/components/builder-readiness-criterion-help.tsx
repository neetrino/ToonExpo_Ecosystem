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
        className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-[0.65rem] font-bold leading-none text-on-dark hover:bg-brand/90"
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
