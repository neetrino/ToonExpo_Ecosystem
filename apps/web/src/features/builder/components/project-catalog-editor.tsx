'use client';

import { useTranslations } from 'next-intl';
import { Controller, type Control, type UseFormRegister } from 'react-hook-form';

import type { TRANSLATION_LOCALES } from '@/features/builder/constants';
import {
  PROJECT_CATALOG_DETAILS_KEYS,
  PROJECT_CATALOG_FINANCE_KEYS,
  PROJECT_CATALOG_MEDIA_LINK_EDITOR_IDS,
  PROJECT_CATALOG_OVERVIEW_KEYS,
  PROJECT_CATALOG_SOCIAL_LINK_EDITOR_IDS,
} from '@/features/builder/constants/project-catalog-editor';
import { ProjectCatalogChecklistEditor } from '@/features/builder/components/project-catalog-checklist-editor';
import {
  ProjectCatalogKvEditor,
  ProjectCatalogOverviewEditor,
} from '@/features/builder/components/project-catalog-layout-fields';
import { TranslationTabs } from '@/features/builder/components/translation-tabs';
import type { UpdateProjectFormValues } from '@/features/builder/schemas/project.schema';
import { ProjectCatalogSectionCard } from '@/features/catalog/components/project-catalog-section-card';
import type { ProjectCatalogLinkId } from '@/features/catalog/utils/project-catalog-links';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';

type ProjectCatalogEditorProps = {
  register: UseFormRegister<UpdateProjectFormValues>;
  control: Control<UpdateProjectFormValues>;
};

type TranslationLocale = (typeof TRANSLATION_LOCALES)[number];

const LINK_LABEL_KEYS = {
  exteriorRenders: 'linkExteriorRenders',
  interiorRenders: 'linkInteriorRenders',
  typicalInteractiveTour: 'linkTypicalInteractiveTour',
  video: 'linkVideo',
  exteriorInteractiveTour: 'linkExteriorInteractiveTour',
  matterport: 'linkMatterport',
  external3d: 'linkExternal3d',
  floorplans2d: 'linkFloorplans2d',
  floorplans3d: 'linkFloorplans3d',
  branding: 'linkBranding',
  map: 'linkMap',
  website: 'linkWebsite',
  facebook: 'linkFacebook',
  instagram: 'linkInstagram',
} as const;

type CatalogLinkLabelKey = (typeof LINK_LABEL_KEYS)[ProjectCatalogLinkId];

const listFieldName = (
  kind: 'amenityLabels' | 'nearbyPlaces',
  locale: TranslationLocale,
):
  | 'amenityLabelsHy'
  | 'amenityLabelsRu'
  | 'amenityLabelsEn'
  | 'nearbyPlacesHy'
  | 'nearbyPlacesRu'
  | 'nearbyPlacesEn' => {
  if (kind === 'amenityLabels') {
    return locale === 'hy'
      ? 'amenityLabelsHy'
      : locale === 'ru'
        ? 'amenityLabelsRu'
        : 'amenityLabelsEn';
  }
  return locale === 'hy'
    ? 'nearbyPlacesHy'
    : locale === 'ru'
      ? 'nearbyPlacesRu'
      : 'nearbyPlacesEn';
};

type CatalogLinkFieldsProps = {
  ids: readonly ProjectCatalogLinkId[];
  register: UseFormRegister<UpdateProjectFormValues>;
  labelFor: (key: CatalogLinkLabelKey) => string;
};

const CatalogLinkFields = ({ ids, register, labelFor }: CatalogLinkFieldsProps) => (
  <div className="grid gap-4 sm:grid-cols-2">
    {ids.map((id) => {
      const fieldId = `catalog-link-${id}`;
      return (
        <FormField key={id} id={fieldId} label={labelFor(LINK_LABEL_KEYS[id])}>
          <Input
            id={fieldId}
            type="url"
            inputMode="url"
            placeholder="https://"
            {...register(`catalogLinks.${id}`)}
          />
        </FormField>
      );
    })}
  </div>
);

/**
 * Admin catalog editor laid out like the public Project details cards
 * (Overview / Details / Finance / Features / Nearby / Links / Socials).
 */
export const ProjectCatalogEditor = ({ register, control }: ProjectCatalogEditorProps) => {
  const t = useTranslations('Builder.projects.catalog');
  const tCatalog = useTranslations('Catalog.projectDetail.catalog');

  return (
    <fieldset className="flex flex-col gap-4 border-t border-border pt-8">
      <legend className="font-brand text-2xl font-bold tracking-tight text-ink-navy">
        {tCatalog('title')}
      </legend>
      <p className="text-sm text-ink-secondary">{t('subtitle')}</p>

      <TranslationTabs>
        {(locale) => (
          <div className="space-y-5 sm:space-y-6">
            <ProjectCatalogSectionCard title={tCatalog('overview')}>
              <ProjectCatalogOverviewEditor
                keys={PROJECT_CATALOG_OVERVIEW_KEYS}
                locale={locale}
                control={control}
                register={register}
              />
            </ProjectCatalogSectionCard>

            <ProjectCatalogSectionCard title={tCatalog('details')}>
              <ProjectCatalogKvEditor
                sectionId="details"
                keys={PROJECT_CATALOG_DETAILS_KEYS}
                locale={locale}
                register={register}
              />
            </ProjectCatalogSectionCard>

            <ProjectCatalogSectionCard title={tCatalog('finance')}>
              <ProjectCatalogKvEditor
                sectionId="finance"
                keys={PROJECT_CATALOG_FINANCE_KEYS}
                locale={locale}
                register={register}
              />
            </ProjectCatalogSectionCard>

            <ProjectCatalogSectionCard title={tCatalog('amenities')}>
              <Controller
                control={control}
                name={listFieldName('amenityLabels', locale)}
                render={({ field }) => (
                  <ProjectCatalogChecklistEditor
                    id={`catalog-amenities-${locale}`}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    addLabel={t('addItem')}
                    removeLabel={t('removeItem')}
                    columns={3}
                  />
                )}
              />
            </ProjectCatalogSectionCard>

            <ProjectCatalogSectionCard title={tCatalog('nearby')}>
              <Controller
                control={control}
                name={listFieldName('nearbyPlaces', locale)}
                render={({ field }) => (
                  <ProjectCatalogChecklistEditor
                    id={`catalog-nearby-${locale}`}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    addLabel={t('addItem')}
                    removeLabel={t('removeItem')}
                    columns={2}
                  />
                )}
              />
            </ProjectCatalogSectionCard>
          </div>
        )}
      </TranslationTabs>

      <div className="mt-2 space-y-5 sm:space-y-6">
        <ProjectCatalogSectionCard title={tCatalog('links')}>
          <p className="mb-4 text-sm text-ink-secondary">{t('linksHint')}</p>
          <CatalogLinkFields
            ids={PROJECT_CATALOG_MEDIA_LINK_EDITOR_IDS}
            register={register}
            labelFor={(key) => tCatalog(key)}
          />
        </ProjectCatalogSectionCard>

        <ProjectCatalogSectionCard title={tCatalog('socials')}>
          <p className="mb-4 text-sm text-ink-secondary">{t('socialsHint')}</p>
          <CatalogLinkFields
            ids={PROJECT_CATALOG_SOCIAL_LINK_EDITOR_IDS}
            register={register}
            labelFor={(key) => tCatalog(key)}
          />
        </ProjectCatalogSectionCard>
      </div>
    </fieldset>
  );
};
