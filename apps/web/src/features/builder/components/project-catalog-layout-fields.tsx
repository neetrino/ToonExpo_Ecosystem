'use client';

import type { ProjectCatalogDetails } from '@/features/catalog/utils/project-catalog-details';
import { PROJECT_CATALOG_CRITERION_ICON } from '@/features/catalog/components/project-catalog-details-bits';
import { useTranslations } from 'next-intl';
import type { Control, UseFormRegister } from 'react-hook-form';
import { Controller, useWatch } from 'react-hook-form';

import type { TRANSLATION_LOCALES } from '@/features/builder/constants';
import {
  catalogDetailKeyToCriterionId,
  catalogPairFollower,
  isCatalogPairFollower,
  isProjectCatalogDateKey,
  isProjectCatalogTextareaKey,
  overviewColumnWeight,
  overviewGridTemplateColumns,
} from '@/features/builder/constants/project-catalog-editor';
import type { UpdateProjectFormValues } from '@/features/builder/schemas/project.schema';
import { DatePicker } from '@/shared/ui/date-picker';
import { parseIsoDate, toIsoDate } from '@/shared/ui/date-picker-utils';
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

const useCatalogFieldLabel = (fieldKey: keyof ProjectCatalogDetails): string => {
  const tCatalog = useTranslations('Catalog.projectDetail.catalog');
  const tExtra = useTranslations('Builder.projects.catalog.fields');
  if (EXTRA_FIELD_LABEL_KEYS.has(fieldKey)) {
    return tExtra(fieldKey as 'pricePerSqmMin');
  }
  return tCatalog(fieldKey as 'propertyType');
};

const MONTH_YEAR_PATTERN = /^(\d{1,2})\/(\d{4})$/;

const catalogDateToIso = (value: string): string => {
  const trimmed = value.trim();
  if (parseIsoDate(trimmed)) {
    return trimmed;
  }
  const match = MONTH_YEAR_PATTERN.exec(trimmed);
  if (!match) {
    return '';
  }
  const month = Number(match[1]);
  const year = Number(match[2]);
  if (month < 1 || month > 12) {
    return '';
  }
  return toIsoDate(new Date(year, month - 1, 1));
};

const isoToCatalogMonthYear = (iso: string): string => {
  const date = parseIsoDate(iso);
  if (!date) {
    return '';
  }
  return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
};

type CatalogDateValueProps = {
  fieldId: string;
  fieldKey: keyof ProjectCatalogDetails;
  locale: TranslationLocale;
  control: Control<UpdateProjectFormValues>;
};

const CatalogDateValue = ({ fieldId, fieldKey, locale, control }: CatalogDateValueProps) => {
  const ariaLabel = useCatalogFieldLabel(fieldKey);
  return (
    <Controller
      control={control}
      name={`catalogDetails.${fieldKey}.${locale}`}
      render={({ field }) => (
        <div className="min-w-0 max-w-xs flex-1 sm:max-w-none">
          <DatePicker
            id={fieldId}
            name={field.name}
            value={catalogDateToIso(field.value ?? '')}
            aria-label={ariaLabel}
            onBlur={field.onBlur}
            onChange={(iso) => field.onChange(isoToCatalogMonthYear(iso))}
            className="h-10 text-sm font-semibold text-ink-navy"
          />
        </div>
      )}
    />
  );
};

type OverviewEditorProps = {
  keys: readonly (keyof ProjectCatalogDetails)[];
  locale: TranslationLocale;
  control: Control<UpdateProjectFormValues>;
  register: UseFormRegister<UpdateProjectFormValues>;
};

/**
 * One overview row — column width follows each value so long text stays visible.
 */
export const ProjectCatalogOverviewEditor = ({
  keys,
  locale,
  control,
  register,
}: OverviewEditorProps) => {
  const tForm = useTranslations('Builder.projects.form.placeholders');
  const catalogDetails = useWatch({ control, name: 'catalogDetails' });
  const templateColumns = overviewGridTemplateColumns(
    keys.map((key) => overviewColumnWeight(catalogDetails?.[key]?.[locale] ?? '')),
  );

  return (
    <div
      className="grid w-full items-start gap-3"
      style={{ gridTemplateColumns: templateColumns }}
    >
      {keys.map((key) => {
        const criterionId = catalogDetailKeyToCriterionId(key);
        const Icon = PROJECT_CATALOG_CRITERION_ICON[criterionId];
        const fieldId = `catalog-overview-${key}-${locale}`;
        return (
          <OverviewField
            key={fieldId}
            fieldId={fieldId}
            fieldKey={key}
            locale={locale}
            Icon={Icon}
            register={register}
            fallbackPlaceholder={tForm('catalogValue')}
          />
        );
      })}
    </div>
  );
};

type OverviewFieldProps = {
  fieldId: string;
  fieldKey: keyof ProjectCatalogDetails;
  locale: TranslationLocale;
  Icon: (typeof PROJECT_CATALOG_CRITERION_ICON)[keyof typeof PROJECT_CATALOG_CRITERION_ICON];
  register: UseFormRegister<UpdateProjectFormValues>;
  fallbackPlaceholder: string;
};

const OverviewField = ({
  fieldId,
  fieldKey,
  locale,
  Icon,
  register,
  fallbackPlaceholder,
}: OverviewFieldProps) => {
  const label = useCatalogFieldLabel(fieldKey);
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
      <span
        className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand-deep"
        aria-hidden
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <Input
        id={fieldId}
        placeholder={label || fallbackPlaceholder}
        className="h-10 w-full min-w-0 px-2 text-center text-sm font-bold text-ink-navy"
        {...register(`catalogDetails.${fieldKey}.${locale}`)}
      />
      <label htmlFor={fieldId} className="text-xs font-medium text-ink-muted">
        {label}
      </label>
    </div>
  );
};

type KvEditorProps = {
  sectionId: 'details' | 'finance';
  keys: readonly (keyof ProjectCatalogDetails)[];
  locale: TranslationLocale;
  control: Control<UpdateProjectFormValues>;
  register: UseFormRegister<UpdateProjectFormValues>;
};

type CatalogKvItemProps = {
  sectionId: 'details' | 'finance';
  fieldKey: keyof ProjectCatalogDetails;
  locale: TranslationLocale;
  control: Control<UpdateProjectFormValues>;
  register: UseFormRegister<UpdateProjectFormValues>;
};

const CatalogKvItem = ({
  sectionId,
  fieldKey,
  locale,
  control,
  register,
}: CatalogKvItemProps) => {
  const fieldId = `catalog-${sectionId}-${fieldKey}-${locale}`;
  const wide = isProjectCatalogTextareaKey(fieldKey);
  const dateField = isProjectCatalogDateKey(fieldKey);
  const Icon = PROJECT_CATALOG_CRITERION_ICON[catalogDetailKeyToCriterionId(fieldKey)];
  const label = useCatalogFieldLabel(fieldKey);
  const tForm = useTranslations('Builder.projects.form.placeholders');
  const placeholder = label || tForm('catalogValue');
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 border-b border-header-border py-3',
        wide && 'sm:col-span-2 sm:flex-col sm:items-stretch',
      )}
    >
      <label
        htmlFor={fieldId}
        className="flex shrink-0 items-start gap-2 pt-2.5 text-sm text-ink-muted"
      >
        {sectionId === 'details' ? (
          <Icon className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={1.75} aria-hidden />
        ) : null}
        {label}
      </label>
      {wide ? (
        <Textarea
          id={fieldId}
          rows={3}
          placeholder={placeholder}
          className="min-h-20 text-sm font-semibold text-ink-navy"
          {...register(`catalogDetails.${fieldKey}.${locale}`)}
        />
      ) : dateField ? (
        <CatalogDateValue
          fieldId={fieldId}
          fieldKey={fieldKey}
          locale={locale}
          control={control}
        />
      ) : (
        <Input
          id={fieldId}
          placeholder={placeholder}
          className="h-10 max-w-xs text-right text-sm font-semibold text-ink-navy sm:max-w-none sm:flex-1"
          {...register(`catalogDetails.${fieldKey}.${locale}`)}
        />
      )}
    </div>
  );
};

/**
 * Editable Details / Finance rows — label left, value right (public list layout).
 */
export const ProjectCatalogKvEditor = ({
  sectionId,
  keys,
  locale,
  control,
  register,
}: KvEditorProps) => (
  <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
    {keys.map((key) => {
      if (isCatalogPairFollower(key)) {
        return null;
      }
      const follower = catalogPairFollower(key);
      const item = (
        <CatalogKvItem
          sectionId={sectionId}
          fieldKey={key}
          locale={locale}
          control={control}
          register={register}
        />
      );
      if (!follower) {
        return (
          <CatalogKvItem
            key={`catalog-${sectionId}-${key}-${locale}`}
            sectionId={sectionId}
            fieldKey={key}
            locale={locale}
            control={control}
            register={register}
          />
        );
      }
      return (
        <div
          key={`catalog-${sectionId}-pair-${key}-${locale}`}
          className="grid grid-cols-1 gap-x-10 sm:col-span-2 sm:grid-cols-2"
        >
          {item}
          <CatalogKvItem
            sectionId={sectionId}
            fieldKey={follower}
            locale={locale}
            control={control}
            register={register}
          />
        </div>
      );
    })}
  </div>
);
