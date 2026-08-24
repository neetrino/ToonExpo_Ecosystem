'use client';

import type { ProjectCatalogDetails } from '@/features/catalog/utils/project-catalog-details';
import { PROJECT_CATALOG_CRITERION_ICON } from '@/features/catalog/components/project-catalog-details-bits';
import { useTranslations } from 'next-intl';
import type { Control, UseFormRegister } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import type { TRANSLATION_LOCALES } from '@/features/builder/constants';
import {
  catalogDetailKeyToCriterionId,
  catalogPairFollower,
  isCatalogPairFollower,
  isProjectCatalogDateKey,
  isProjectCatalogTextareaKey,
} from '@/features/builder/constants/project-catalog-editor';
import {
  getCatalogFieldPlaceholder,
} from '@/features/builder/constants/project-content-placeholders';
import type { UpdateProjectFormValues } from '@/features/builder/schemas/project.schema';
import { DatePicker } from '@/shared/ui/date-picker';
import { parseIsoDate, toIsoDate } from '@/shared/ui/date-picker-utils';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { cn } from '@/shared/ui/cn';

type TranslationLocale = (typeof TRANSLATION_LOCALES)[number];

/** Compact value control — sits on the right of the label row (public catalog layout). */
const CATALOG_VALUE_CONTROL_CLASS =
  'ml-auto h-10 w-full max-w-[12.5rem] shrink-0 text-left text-sm font-semibold text-ink-navy';

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
        <div className="ml-auto w-full max-w-[12.5rem] shrink-0">
          <DatePicker
            id={fieldId}
            name={field.name}
            value={catalogDateToIso(field.value ?? '')}
            aria-label={ariaLabel}
            onBlur={field.onBlur}
            onChange={(iso) => field.onChange(isoToCatalogMonthYear(iso))}
            className="h-10 justify-start text-left text-sm font-semibold text-ink-navy"
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
 * Overview stats editor — equal columns, matches public catalog icon layout.
 */
export const ProjectCatalogOverviewEditor = ({
  keys,
  locale,
  register,
}: OverviewEditorProps) => {
  return (
    <div
      className={cn(
        'grid w-full gap-x-4 gap-y-6',
        keys.length <= 3 && 'grid-cols-2 sm:grid-cols-3',
        keys.length === 4 && 'grid-cols-2 sm:grid-cols-4',
        keys.length >= 5 && 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
      )}
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
};

const OverviewField = ({
  fieldId,
  fieldKey,
  locale,
  Icon,
  register,
}: OverviewFieldProps) => {
  const label = useCatalogFieldLabel(fieldKey);
  const placeholder = getCatalogFieldPlaceholder(locale, fieldKey);
  return (
    <div className="flex min-w-0 flex-col items-center gap-2.5 text-center">
      <span
        className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand-deep"
        aria-hidden
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <Input
        id={fieldId}
        placeholder={placeholder}
        title={label}
        className={cn(
          'h-10 w-full min-w-0 rounded-lg border-border/70 bg-surface px-2.5',
          'text-center text-sm font-semibold tracking-tight text-ink-navy',
          'placeholder:font-medium',
        )}
        {...register(`catalogDetails.${fieldKey}.${locale}`)}
      />
      <label
        htmlFor={fieldId}
        className="line-clamp-2 min-h-8 text-xs font-medium leading-snug text-ink-muted"
      >
        {label}
      </label>
    </div>
  );
};

type CatalogKvSectionId = 'details' | 'finance' | 'bankPartner';

type KvEditorProps = {
  sectionId: CatalogKvSectionId;
  keys: readonly (keyof ProjectCatalogDetails)[];
  locale: TranslationLocale;
  control: Control<UpdateProjectFormValues>;
  register: UseFormRegister<UpdateProjectFormValues>;
};

type CatalogKvItemProps = {
  sectionId: CatalogKvSectionId;
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
  const useTextarea = isProjectCatalogTextareaKey(fieldKey);
  const wide = sectionId === 'bankPartner' ? fieldKey === 'specialTerms' : useTextarea;
  const dateField = isProjectCatalogDateKey(fieldKey);
  const Icon = PROJECT_CATALOG_CRITERION_ICON[catalogDetailKeyToCriterionId(fieldKey)];
  const label = useCatalogFieldLabel(fieldKey);
  const placeholder = getCatalogFieldPlaceholder(locale, fieldKey);
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
        {sectionId !== 'bankPartner' ? (
          <Icon className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={1.75} aria-hidden />
        ) : null}
        {label}
      </label>
      {useTextarea ? (
        <Textarea
          id={fieldId}
          rows={3}
          placeholder={placeholder}
          className="min-h-20 w-full text-left text-sm font-semibold text-ink-navy"
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
          className={CATALOG_VALUE_CONTROL_CLASS}
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
