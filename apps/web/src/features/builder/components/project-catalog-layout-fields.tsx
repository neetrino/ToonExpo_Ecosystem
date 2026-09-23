'use client';

import type { ProjectCatalogDetails } from '@/features/catalog/utils/project-catalog-details';
import { PROJECT_CATALOG_CRITERION_ICON } from '@/features/catalog/components/project-catalog-details-bits';
import { useLocale, useTranslations } from 'next-intl';
import type { Control, UseFormRegister } from 'react-hook-form';

import type { TRANSLATION_LOCALES } from '@/features/builder/constants';
import {
  catalogDetailKeyToCriterionId,
  catalogPairFollower,
  catalogPairLeader,
  isProjectCatalogDateKey,
  isProjectCatalogTextareaKey,
} from '@/features/builder/constants/project-catalog-editor';
import { ProjectCatalogSharedValue } from '@/features/builder/components/project-catalog-shared-value';
import { getCatalogFieldPlaceholder } from '@/features/builder/constants/project-content-placeholders';
import type { UpdateProjectFormValues } from '@/features/builder/schemas/project.schema';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { cn } from '@/shared/ui/cn';

type TranslationLocale = (typeof TRANSLATION_LOCALES)[number];

/** Compact value control — fixed right column so rows stay aligned without overflow. */
const CATALOG_VALUE_COL_CLASS = 'min-w-0 w-full';
const CATALOG_VALUE_CONTROL_CLASS =
  'h-10 w-full min-w-0 text-left text-sm font-semibold text-ink-navy';
/** Label | value: value column capped so long Armenian labels wrap instead of pushing out. */
const CATALOG_KV_ROW_CLASS =
  'grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,12.5rem)] items-start gap-3 border-b border-header-border py-3';

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

type OverviewEditorProps = {
  keys: readonly (keyof ProjectCatalogDetails)[];
  locale?: TranslationLocale | undefined;
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
  control,
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
        const fieldId = `catalog-overview-${key}-${locale ?? 'shared'}`;
        return (
          <OverviewField
            key={fieldId}
            fieldId={fieldId}
            fieldKey={key}
            locale={locale}
            Icon={Icon}
            register={register}
            control={control}
          />
        );
      })}
    </div>
  );
};

type OverviewFieldProps = {
  fieldId: string;
  fieldKey: keyof ProjectCatalogDetails;
  locale?: TranslationLocale | undefined;
  Icon: (typeof PROJECT_CATALOG_CRITERION_ICON)[keyof typeof PROJECT_CATALOG_CRITERION_ICON];
  register: UseFormRegister<UpdateProjectFormValues>;
  control: Control<UpdateProjectFormValues>;
};

const OVERVIEW_INPUT_CLASS = cn(
  'h-10 w-full min-w-0 rounded-lg border-border/70 bg-surface px-2.5',
  'text-center text-sm font-semibold tracking-tight text-ink-navy',
  'placeholder:font-medium',
);

const OverviewField = ({
  fieldId,
  fieldKey,
  locale,
  Icon,
  register,
  control,
}: OverviewFieldProps) => {
  const uiLocale = useLocale();
  const label = useCatalogFieldLabel(fieldKey);
  const placeholder = getCatalogFieldPlaceholder(locale ?? uiLocale, fieldKey);
  return (
    <div className="flex min-w-0 flex-col items-center gap-2.5 text-center">
      <span
        className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand-deep"
        aria-hidden
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      {locale == null ? (
        <ProjectCatalogSharedValue
          fieldId={fieldId}
          fieldKey={fieldKey}
          control={control}
          kind="input"
          placeholder={placeholder}
          ariaLabel={label}
          className={OVERVIEW_INPUT_CLASS}
        />
      ) : (
        <Input
          id={fieldId}
          placeholder={placeholder}
          title={label}
          className={OVERVIEW_INPUT_CLASS}
          {...register(`catalogDetails.${fieldKey}.${locale}`)}
        />
      )}
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
  locale?: TranslationLocale | undefined;
  control: Control<UpdateProjectFormValues>;
  register: UseFormRegister<UpdateProjectFormValues>;
};

type CatalogKvItemProps = {
  sectionId: CatalogKvSectionId;
  fieldKey: keyof ProjectCatalogDetails;
  locale?: TranslationLocale | undefined;
  control: Control<UpdateProjectFormValues>;
  register: UseFormRegister<UpdateProjectFormValues>;
};

const CatalogKvItem = ({ sectionId, fieldKey, locale, control, register }: CatalogKvItemProps) => {
  const uiLocale = useLocale();
  const fieldId = `catalog-${sectionId}-${fieldKey}-${locale ?? 'shared'}`;
  const useTextarea = isProjectCatalogTextareaKey(fieldKey);
  const wide = sectionId === 'bankPartner' ? fieldKey === 'specialTerms' : useTextarea;
  const dateField = isProjectCatalogDateKey(fieldKey);
  const Icon = PROJECT_CATALOG_CRITERION_ICON[catalogDetailKeyToCriterionId(fieldKey)];
  const label = useCatalogFieldLabel(fieldKey);
  const placeholder = getCatalogFieldPlaceholder(locale ?? uiLocale, fieldKey);
  const sharedKind = useTextarea ? 'textarea' : dateField ? 'date' : 'input';
  return (
    <div className={cn(CATALOG_KV_ROW_CLASS, wide && 'sm:col-span-2 sm:grid-cols-1')}>
      <label
        htmlFor={fieldId}
        className="flex min-w-0 items-start gap-2 pt-2.5 text-sm text-ink-muted"
      >
        {sectionId !== 'bankPartner' ? (
          <Icon className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={1.75} aria-hidden />
        ) : null}
        <span className="min-w-0 break-words">{label}</span>
      </label>
      {locale == null || dateField ? (
        <ProjectCatalogSharedValue
          fieldId={fieldId}
          fieldKey={fieldKey}
          control={control}
          kind={dateField ? 'date' : sharedKind}
          placeholder={placeholder}
          ariaLabel={label}
          className={
            useTextarea
              ? 'min-h-20 w-full min-w-0 text-left text-sm font-semibold text-ink-navy'
              : CATALOG_VALUE_CONTROL_CLASS
          }
        />
      ) : useTextarea ? (
        <Textarea
          id={fieldId}
          rows={3}
          placeholder={placeholder}
          className="min-h-20 w-full min-w-0 text-left text-sm font-semibold text-ink-navy"
          {...register(`catalogDetails.${fieldKey}.${locale}`)}
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
  <div className="grid min-w-0 grid-cols-1 gap-x-10 sm:grid-cols-2">
    {keys.map((key) => {
      const leader = catalogPairLeader(key);
      if (leader != null && keys.includes(leader)) {
        return null;
      }
      const follower = catalogPairFollower(key);
      const pairedFollower = follower != null && keys.includes(follower) ? follower : null;
      const itemKey = `catalog-${sectionId}-${key}-${locale ?? 'shared'}`;
      if (pairedFollower == null) {
        return (
          <CatalogKvItem
            key={itemKey}
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
          key={`catalog-${sectionId}-pair-${key}-${locale ?? 'shared'}`}
          className="grid min-w-0 grid-cols-1 gap-x-10 sm:col-span-2 sm:grid-cols-2"
        >
          <CatalogKvItem
            sectionId={sectionId}
            fieldKey={key}
            locale={locale}
            control={control}
            register={register}
          />
          <CatalogKvItem
            sectionId={sectionId}
            fieldKey={pairedFollower}
            locale={locale}
            control={control}
            register={register}
          />
        </div>
      );
    })}
  </div>
);
