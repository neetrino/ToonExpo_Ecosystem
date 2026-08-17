'use client';

import {
  BANK_PARTNER_OFFER_FINANCE_KEYS,
  type BankPartnerOfferTemplateItem,
} from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { UseFormSetValue } from 'react-hook-form';

import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { TRANSLATION_LOCALES } from '@/features/builder/constants';
import type { UpdateProjectFormValues } from '@/features/builder/schemas/project.schema';
import { useSelectableTemplatesQuery } from '@/features/admin/hooks/use-project-bank-partner-offers';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { Button } from '@/shared/ui/button';

type ProjectFinanceTemplateImportProps = {
  setValue: UseFormSetValue<UpdateProjectFormValues>;
};

/**
 * Imports a published Template/Partner Offer into project Finance form fields.
 */
export const ProjectFinanceTemplateImport = ({
  setValue,
}: ProjectFinanceTemplateImportProps) => {
  const t = useTranslations('Builder.projects.catalog.financeImport');
  const scope = useCatalogScope();
  const [open, setOpen] = useState(false);
  const templatesQuery = useSelectableTemplatesQuery(scope);

  const applyTemplate = (template: BankPartnerOfferTemplateItem): void => {
    for (const key of BANK_PARTNER_OFFER_FINANCE_KEYS) {
      const localeText = template.fields[key] ?? { hy: '', ru: '', en: '' };
      for (const locale of TRANSLATION_LOCALES) {
        setValue(`catalogDetails.${key}.${locale}`, localeText[locale] ?? '', {
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    }
    setOpen(false);
  };

  const templates = templatesQuery.data?.data ?? [];

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={templatesQuery.isLoading}
        onClick={() => setOpen(true)}
      >
        {t('button')}
      </Button>

      <AdminCreateSheet open={open} title={t('title')} onClose={() => setOpen(false)}>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink-secondary">{t('hint')}</p>

          {templatesQuery.isLoading ? (
            <p className="text-sm text-ink-secondary">{t('loading')}</p>
          ) : null}

          {templatesQuery.isError ? (
            <p role="alert" className="text-sm text-danger">
              {t('error')}
            </p>
          ) : null}

          {!templatesQuery.isLoading && templates.length === 0 ? (
            <p className="text-sm text-ink-secondary">{t('empty')}</p>
          ) : null}

          <ul className="flex flex-col gap-2">
            {templates.map((template) => (
              <li key={template.id}>
                <button
                  type="button"
                  className="flex w-full flex-col gap-0.5 rounded-xl border border-border bg-surface px-3 py-2.5 text-left transition-colors hover:bg-surface-muted"
                  onClick={() => applyTemplate(template)}
                >
                  <span className="font-medium text-ink-navy">{template.name}</span>
                  <span className="text-sm text-ink-secondary">
                    {template.partnerCompanyName}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            {t('cancel')}
          </Button>
        </div>
      </AdminCreateSheet>
    </>
  );
};
