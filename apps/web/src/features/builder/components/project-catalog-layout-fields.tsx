'use client';

import type { ProjectCatalogDetails } from '@/features/catalog/utils/project-catalog-details';
import { PROJECT_CATALOG_CRITERION_ICON } from '@/features/catalog/components/project-catalog-details-bits';
import { useTranslations } from 'next-intl';
import type { UseFormRegister } from 'react-hook-form';

import { TRANSLATION_LOCALES } from '@/features/builder/constants';
import {
  catalogDetailKeyToCriterionId,
  isProjectCatalogTextareaKey,
} from '@/features/builder/constants/project-catalog-editor';
import type { UpdateProjectFormValues } from '@/features/builder/schemas/project.schema';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { cn } from '@/shared/ui/cn';

type TranslationLocale = (typeof TRANSLATION_LOCALES)[number];

const EXTRA_FIELD_LABEL_KEYS = new Set([
  'pricePerSqmMin',
  'pricePerSqmMax',
  'areaMinSqm',
  'areaMaxSqm',
  'unitPriceMin',
  'unitPriceMax',
  'ceilingHeightM',
]);

type LabelProps = {
  fieldKey: keyof ProjectCatalogDetails;
};

const CatalogFieldLabel = ({ fieldKey }: LabelProps) => {
  const tCatalog = useTranslations('Catalog.projectDetail.catalog');
  const tExtra = useTranslations('Builder.projects.catalog.fields');
  if (EXTRA_FIELD_LABEL_KEYS.has(fieldKey)) {
    return tExtra(fieldKey as 'pricePerSqmMin');
  }
  return tCatalog(fieldKey as 'propertyType');
};

type OverviewEditorProps = {
  keys: readonly (keyof ProjectCatalogDetails)[];
  locale: TranslationLocale;
  register: UseFormRegister<UpdateProjectFormValues>;
};

/**
 * Editable Overview grid — same icon + value + label stack as the public page.
 */
export const ProjectCatalogOverviewEditor = ({
  keys,
  locale,
  register,
}: OverviewEditorProps) => (
  <div
    className={cn(
      'grid gap-6',
      keys.length <= 3 && 'grid-cols-2 sm:grid-cols-3',
      keys.length === 4 && 'grid-cols-2 sm:grid-cols-4',
      keys.length >= 5 && 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
    )}
  >
    {keys.map((key) => {
      const criterionId = catalogDetailKeyToCriterionId(key);
      const Icon = PROJECT_CATALOG_CRITERION_ICON[criterionId];
      const fieldId = `catalog-overview-${key}-${locale}`;
      return (
        <div key={fieldId} className="flex flex-col items-center gap-2 text-center">
          <span
            className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand-deep"
            aria-hidden
          >
            <Icon className="size-5" strokeWidth={1.75} />
          </span>
          <Input
            id={fieldId}
            className="h-10 text-center text-sm font-bold text-ink-navy"
            {...register(`catalogDetails.${key}.${locale}`)}
          />
          <label htmlFor={fieldId} className="text-xs font-medium text-ink-muted">
            <CatalogFieldLabel fieldKey={key} />
          </label>
        </div>
      );
    })}
  </div>
);

type KvEditorProps = {
  sectionId: 'details' | 'finance';
  keys: readonly (keyof ProjectCatalogDetails)[];
  locale: TranslationLocale;
  register: UseFormRegister<UpdateProjectFormValues>;
};

/**
 * Editable Details / Finance rows — label left, value right (public list layout).
 */
export const ProjectCatalogKvEditor = ({
  sectionId,
  keys,
  locale,
  register,
}: KvEditorProps) => (
  <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
    {keys.map((key) => {
      const fieldId = `catalog-${sectionId}-${key}-${locale}`;
      const wide = isProjectCatalogTextareaKey(key);
      return (
        <div
          key={fieldId}
          className={cn(
            'flex items-start justify-between gap-4 border-b border-header-border py-3',
            wide && 'sm:col-span-2 sm:flex-col sm:items-stretch',
          )}
        >
          <label htmlFor={fieldId} className="shrink-0 pt-2.5 text-sm text-ink-muted">
            <CatalogFieldLabel fieldKey={key} />
          </label>
          {wide ? (
            <Textarea
              id={fieldId}
              rows={3}
              className="min-h-20 text-sm font-semibold text-ink-navy"
              {...register(`catalogDetails.${key}.${locale}`)}
            />
          ) : (
            <Input
              id={fieldId}
              className="h-10 max-w-xs text-right text-sm font-semibold text-ink-navy sm:max-w-none sm:flex-1"
              {...register(`catalogDetails.${key}.${locale}`)}
            />
          )}
        </div>
      );
    })}
  </div>
);
