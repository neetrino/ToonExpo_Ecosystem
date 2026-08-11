'use client';

import type { ProjectCatalogDetails } from '@/features/catalog/utils/project-catalog-details';
import { useTranslations } from 'next-intl';
import type { UseFormRegister } from 'react-hook-form';

import {
  isProjectCatalogTextareaKey,
  type ProjectCatalogEditorSectionId,
} from '@/features/builder/constants/project-catalog-editor';
import type { UpdateProjectFormValues } from '@/features/builder/schemas/project.schema';
import { TRANSLATION_LOCALES } from '@/features/builder/constants';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

type TranslationLocale = (typeof TRANSLATION_LOCALES)[number];

type ProjectCatalogDetailFieldsProps = {
  sectionId: ProjectCatalogEditorSectionId;
  keys: readonly (keyof ProjectCatalogDetails)[];
  locale: TranslationLocale;
  register: UseFormRegister<UpdateProjectFormValues>;
};

const EXTRA_FIELD_LABEL_KEYS = new Set([
  'pricePerSqmMin',
  'pricePerSqmMax',
  'areaMinSqm',
  'areaMaxSqm',
  'unitPriceMin',
  'unitPriceMax',
  'ceilingHeightM',
]);

/**
 * Localized catalog detail inputs for one editor section + active language tab.
 */
export const ProjectCatalogDetailFields = ({
  sectionId,
  keys,
  locale,
  register,
}: ProjectCatalogDetailFieldsProps) => {
  const tCatalog = useTranslations('Catalog.projectDetail.catalog');
  const tExtra = useTranslations('Builder.projects.catalog.fields');

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {keys.map((key) => {
        const fieldId = `catalog-${sectionId}-${key}-${locale}`;
        const label = EXTRA_FIELD_LABEL_KEYS.has(key)
          ? tExtra(key as 'pricePerSqmMin')
          : tCatalog(key as 'propertyType');
        const wide = isProjectCatalogTextareaKey(key);
        const className = wide ? 'sm:col-span-2' : undefined;

        if (wide) {
          return (
            <FormField key={fieldId} id={fieldId} label={label} className={className}>
              <Textarea
                id={fieldId}
                rows={3}
                {...register(`catalogDetails.${key}.${locale}`)}
              />
            </FormField>
          );
        }

        return (
          <FormField key={fieldId} id={fieldId} label={label} className={className}>
            <Input id={fieldId} {...register(`catalogDetails.${key}.${locale}`)} />
          </FormField>
        );
      })}
    </div>
  );
};
