'use client';

import type { BankPartnerOfferTemplateItem } from '@toonexpo/contracts';
import { Import } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import {
  useApplyProjectBankPartnerOffersMutation,
  useProjectBankPartnerOffersQuery,
  useSelectableTemplatesQuery,
} from '@/features/admin/hooks/use-project-bank-partner-offers';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { Button } from '@/shared/ui/button';

type ProjectBankPartnerOfferImportSheetProps = {
  projectId: string;
  open: boolean;
  onClose: () => void;
};

/**
 * Multi-select import of published Template/Partner Offers onto a project.
 */
export const ProjectBankPartnerOfferImportSheet = ({
  projectId,
  open,
  onClose,
}: ProjectBankPartnerOfferImportSheetProps) => {
  const t = useTranslations('Builder.projects.catalog.financeImport');
  const scope = useCatalogScope();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const templatesQuery = useSelectableTemplatesQuery(scope);
  const offersQuery = useProjectBankPartnerOffersQuery(scope, projectId);
  const applyMutation = useApplyProjectBankPartnerOffersMutation(scope, projectId);

  const appliedTemplateIds = useMemo(
    () =>
      new Set(
        (offersQuery.data?.data ?? [])
          .map((offer) => offer.templateId)
          .filter((id): id is string => id != null),
      ),
    [offersQuery.data?.data],
  );

  const templates = templatesQuery.data?.data ?? [];
  const importable = templates.filter((template) => !appliedTemplateIds.has(template.id));

  const toggleTemplate = (templateId: string, checked: boolean): void => {
    setSelectedIds((current) =>
      checked
        ? [...current, templateId]
        : current.filter((id) => id !== templateId),
    );
  };

  const handleImport = async (): Promise<void> => {
    if (selectedIds.length === 0) {
      return;
    }
    await applyMutation.mutateAsync({ templateIds: selectedIds });
    setSelectedIds([]);
    onClose();
  };

  const handleClose = (): void => {
    setSelectedIds([]);
    onClose();
  };

  return (
    <AdminCreateSheet open={open} title={t('title')} onClose={handleClose}>
      <div className="flex flex-col gap-3">
        <p className="text-sm text-ink-secondary">{t('hintMulti')}</p>

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

        {!templatesQuery.isLoading && templates.length > 0 && importable.length === 0 ? (
          <p className="text-sm text-ink-secondary">{t('allApplied')}</p>
        ) : null}

        <ul className="flex flex-col gap-2">
          {templates.map((template) => (
            <TemplateImportRow
              key={template.id}
              template={template}
              applied={appliedTemplateIds.has(template.id)}
              checked={selectedIds.includes(template.id)}
              onToggle={(checked) => toggleTemplate(template.id, checked)}
            />
          ))}
        </ul>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="button"
            variant="secondary"
            className="inline-flex items-center gap-1.5"
            disabled={selectedIds.length === 0 || applyMutation.isPending}
            onClick={() => void handleImport()}
          >
            <Import className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
            {t('importSelected', { count: selectedIds.length })}
          </Button>
          <Button type="button" variant="ghost" onClick={handleClose}>
            {t('cancel')}
          </Button>
        </div>
      </div>
    </AdminCreateSheet>
  );
};

type TemplateImportRowProps = {
  template: BankPartnerOfferTemplateItem;
  applied: boolean;
  checked: boolean;
  onToggle: (checked: boolean) => void;
};

const TemplateImportRow = ({
  template,
  applied,
  checked,
  onToggle,
}: TemplateImportRowProps) => {
  const t = useTranslations('Builder.projects.catalog.financeImport');

  return (
    <li>
      <label
        className={`flex w-full items-start gap-3 rounded-xl border border-border px-3 py-2.5 ${
          applied ? 'bg-surface-muted opacity-70' : 'bg-surface'
        }`}
      >
        <input
          type="checkbox"
          checked={applied || checked}
          disabled={applied}
          onChange={(event) => onToggle(event.target.checked)}
          aria-label={template.name}
          className="mt-1 size-4 shrink-0 rounded border-border"
        />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-medium text-ink-navy">{template.name}</span>
          {applied ? (
            <span className="text-xs text-ink-muted">{t('alreadyApplied')}</span>
          ) : null}
        </span>
      </label>
    </li>
  );
};
