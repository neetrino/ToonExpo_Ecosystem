'use client';

import type { Control, UseFormRegister } from 'react-hook-form';

import { splitCatalogEditorKeys } from '@/features/builder/constants/project-catalog-editor';
import {
  ProjectCatalogKvEditor,
  ProjectCatalogOverviewEditor,
} from '@/features/builder/components/project-catalog-layout-fields';
import { TranslationTabs } from '@/features/builder/components/translation-tabs';
import type { UpdateProjectFormValues } from '@/features/builder/schemas/project.schema';
import { ProjectCatalogSectionCard } from '@/features/catalog/components/project-catalog-section-card';
import type { ProjectCatalogDetails } from '@/features/catalog/utils/project-catalog-details';

type CatalogMixedSectionProps = {
  title: string;
  keys: readonly (keyof ProjectCatalogDetails)[];
  variant: 'overview' | 'details' | 'finance';
  register: UseFormRegister<UpdateProjectFormValues>;
  control: Control<UpdateProjectFormValues>;
};

/**
 * Catalog card: language-independent fields once, translated fields behind hy/ru/en tabs.
 */
export const ProjectCatalogMixedSection = ({
  title,
  keys,
  variant,
  register,
  control,
}: CatalogMixedSectionProps) => {
  const split = splitCatalogEditorKeys(keys);
  return (
    <ProjectCatalogSectionCard title={title}>
      <div className="flex flex-col gap-6">
        {split.staticKeys.length > 0 ? (
          <CatalogKeyFields
            keys={split.staticKeys}
            variant={variant}
            register={register}
            control={control}
          />
        ) : null}
        {split.translatedKeys.length > 0 ? (
          <TranslationTabs>
            {(locale) => (
              <CatalogKeyFields
                keys={split.translatedKeys}
                variant={variant}
                locale={locale}
                register={register}
                control={control}
              />
            )}
          </TranslationTabs>
        ) : null}
      </div>
    </ProjectCatalogSectionCard>
  );
};

type CatalogKeyFieldsProps = {
  keys: readonly (keyof ProjectCatalogDetails)[];
  variant: 'overview' | 'details' | 'finance';
  locale?: 'hy' | 'ru' | 'en' | undefined;
  register: UseFormRegister<UpdateProjectFormValues>;
  control: Control<UpdateProjectFormValues>;
};

const CatalogKeyFields = ({
  keys,
  variant,
  locale,
  register,
  control,
}: CatalogKeyFieldsProps) => {
  if (variant === 'overview') {
    return (
      <ProjectCatalogOverviewEditor
        keys={keys}
        locale={locale}
        control={control}
        register={register}
      />
    );
  }
  return (
    <ProjectCatalogKvEditor
      sectionId={variant}
      keys={keys}
      locale={locale}
      control={control}
      register={register}
    />
  );
};
