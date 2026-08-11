'use client';

import { useTranslations } from 'next-intl';
import type { UseFormRegister } from 'react-hook-form';

import { TRANSLATION_LOCALES } from '@/features/builder/constants';
import {
  PROJECT_CATALOG_EDITOR_SECTIONS,
  PROJECT_CATALOG_LINK_EDITOR_IDS,
} from '@/features/builder/constants/project-catalog-editor';
import { ProjectCatalogDetailFields } from '@/features/builder/components/project-catalog-detail-fields';
import { TranslationTabs } from '@/features/builder/components/translation-tabs';
import type { UpdateProjectFormValues } from '@/features/builder/schemas/project.schema';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

type ProjectCatalogEditorProps = {
  register: UseFormRegister<UpdateProjectFormValues>;
};

type TranslationLocale = (typeof TRANSLATION_LOCALES)[number];

const LINK_LABEL_KEYS = {
  exteriorRenders: 'linkExteriorRenders',
  interiorRenders: 'linkInteriorRenders',
  typicalInteractiveTour: 'linkTypicalInteractiveTour',
  video: 'linkVideo',
  exteriorInteractiveTour: 'linkExteriorInteractiveTour',
  map: 'linkMap',
  website: 'linkWebsite',
  facebook: 'linkFacebook',
  instagram: 'linkInstagram',
} as const;

const listFieldName = (
  kind: 'amenityLabels' | 'nearbyPlaces',
  locale: TranslationLocale,
): keyof UpdateProjectFormValues => {
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

/**
 * Admin editor for public Project details JSON (overview / details / finance /
 * features / nearby / links).
 */
export const ProjectCatalogEditor = ({ register }: ProjectCatalogEditorProps) => {
  const t = useTranslations('Builder.projects.catalog');
  const tCatalog = useTranslations('Catalog.projectDetail.catalog');

  return (
    <fieldset className="flex flex-col gap-6 border-t border-border pt-6">
      <legend className="text-base font-semibold text-ink">{t('title')}</legend>
      <p className="text-sm text-ink-secondary">{t('subtitle')}</p>

      <TranslationTabs>
        {(locale) => (
          <div className="flex flex-col gap-8">
            {PROJECT_CATALOG_EDITOR_SECTIONS.map((section) => (
              <section key={section.id} className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold tracking-wide text-ink uppercase">
                  {t(`sections.${section.id}`)}
                </h3>
                <ProjectCatalogDetailFields
                  sectionId={section.id}
                  keys={section.keys}
                  locale={locale}
                  register={register}
                />
              </section>
            ))}

            <section className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold tracking-wide text-ink uppercase">
                {t('sections.features')}
              </h3>
              <FormField id={`catalog-amenities-${locale}`} label={t('amenityLabels')}>
                <Textarea
                  id={`catalog-amenities-${locale}`}
                  rows={6}
                  {...register(listFieldName('amenityLabels', locale))}
                />
              </FormField>
              <p className="text-xs text-ink-muted">{t('listHint')}</p>
            </section>

            <section className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold tracking-wide text-ink uppercase">
                {t('sections.nearby')}
              </h3>
              <FormField id={`catalog-nearby-${locale}`} label={t('nearbyPlaces')}>
                <Textarea
                  id={`catalog-nearby-${locale}`}
                  rows={4}
                  {...register(listFieldName('nearbyPlaces', locale))}
                />
              </FormField>
              <p className="text-xs text-ink-muted">{t('listHint')}</p>
            </section>
          </div>
        )}
      </TranslationTabs>

      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold tracking-wide text-ink uppercase">
          {t('sections.links')}
        </h3>
        <p className="text-sm text-ink-secondary">{t('linksHint')}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {PROJECT_CATALOG_LINK_EDITOR_IDS.map((id) => {
            const fieldId = `catalog-link-${id}`;
            return (
              <FormField key={id} id={fieldId} label={tCatalog(LINK_LABEL_KEYS[id])}>
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
      </section>
    </fieldset>
  );
};
