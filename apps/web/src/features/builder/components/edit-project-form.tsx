'use client';

import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { catalogMediaContext } from '@/features/builder/catalog-scope';
import { zodResolver } from '@hookform/resolvers/zod';
import type { PortalProjectDetail } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  FORM_SAVE_BAR_SCROLL_CLEARANCE_CLASS,
  FormSaveBar,
} from '@/features/builder/components/form-save-bar';
import { ProjectCatalogEditor } from '@/features/builder/components/project-catalog-editor';
import { TranslationTabs } from '@/features/builder/components/translation-tabs';
import { getProjectFormPlaceholder } from '@/features/builder/constants/project-content-placeholders';
import { useAutoProjectSlug } from '@/features/builder/hooks/use-auto-project-slug';
import { useUpdatePortalProjectMutation } from '@/features/builder/hooks/use-portal-projects';
import { useSavedProjectCover } from '@/features/builder/hooks/use-saved-project-cover-url';
import {
  updateProjectSchema,
  type UpdateProjectFormValues,
} from '@/features/builder/schemas/project.schema';
import { catalogJsonToFormSlice } from '@/features/builder/utils/project-catalog-amenities';
import { toUpdateProjectRequest } from '@/features/builder/utils/project-mappers';
import { VerifiedStatusField } from '@/features/builder/components/verified-status-field';
import { MediaUploadField } from '@/features/media/components/media-upload-field';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/cn';
import { DatePicker } from '@/shared/ui/date-picker';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { useSuccessToast } from '@/shared/ui/use-success-toast';

type EditProjectFormProps = {
  project: PortalProjectDetail;
};

const toFormValues = (project: PortalProjectDetail): UpdateProjectFormValues => ({
  nameHy: project.translations?.name?.hy ?? project.name,
  nameRu: project.translations?.name?.ru ?? '',
  nameEn: project.translations?.name?.en ?? '',
  slug: project.slug,
  shortDescriptionHy: project.translations?.shortDescription?.hy ?? project.shortDescription ?? '',
  shortDescriptionRu: project.translations?.shortDescription?.ru ?? '',
  shortDescriptionEn: project.translations?.shortDescription?.en ?? '',
  fullDescriptionHy: project.translations?.fullDescription?.hy ?? project.fullDescription ?? '',
  fullDescriptionRu: project.translations?.fullDescription?.ru ?? '',
  fullDescriptionEn: project.translations?.fullDescription?.en ?? '',
  locationTextHy: project.translations?.locationText?.hy ?? project.locationText ?? '',
  locationTextRu: project.translations?.locationText?.ru ?? '',
  locationTextEn: project.translations?.locationText?.en ?? '',
  address: project.address ?? '',
  city: project.city ?? '',
  district: project.district ?? '',
  projectType: project.projectType ?? '',
  constructionStatus: project.constructionStatus ?? '',
  completionDate: project.completionDate ?? '',
  ...catalogJsonToFormSlice(project.amenities, project.nearbyPlaces),
  coverMediaId: project.coverMediaId ?? project.cover?.id ?? '',
  verified: project.verified,
});

/**
 * Edit form for portal project fields, translations, and public catalog JSON.
 */
export const EditProjectForm = ({ project }: EditProjectFormProps) => {
  const scope = useCatalogScope();
  const mediaContext = catalogMediaContext(scope);
  const t = useTranslations('Builder.projects');
  const siteLocale = useLocale();
  const updateMutation = useUpdatePortalProjectMutation(project.id);
  const savedCover = useSavedProjectCover(project);
  const initialValues = toFormValues(project);
  const [formError, setFormError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(savedCover.url);
  const { showSuccess, successToast } = useSuccessToast();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
  } = useForm<UpdateProjectFormValues>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      ...initialValues,
      coverMediaId: initialValues.coverMediaId || savedCover.mediaId || '',
    },
  });

  const { lockSlugAuto } = useAutoProjectSlug({
    control,
    getSlug: () => getValues('slug'),
    setSlug: (slug) =>
      setValue('slug', slug, { shouldDirty: true, shouldValidate: true }),
  });
  const slugField = register('slug');

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const shouldSendCover =
        values.coverMediaId.length > 0 || Boolean(dirtyFields.coverMediaId);
      const updated = await updateMutation.mutateAsync(
        toUpdateProjectRequest(values, { includeCoverMediaId: shouldSendCover }),
      );
      const nextValues = toFormValues(updated);
      if (!nextValues.coverMediaId && values.coverMediaId) {
        nextValues.coverMediaId = values.coverMediaId;
      }
      reset(nextValues, { keepDirty: false });
      setPreviewUrl(updated.cover?.thumbnailUrl ?? updated.cover?.fileUrl ?? previewUrl);
      showSuccess(t('detail.saveSuccess'));
    } catch {
      setFormError(t('errors.generic'));
    }
  });

  const busy = isSubmitting || updateMutation.isPending;

  return (
    <>
    <form
      onSubmit={onSubmit}
      className={cn('flex flex-col gap-5', FORM_SAVE_BAR_SCROLL_CLEARANCE_CLASS)}
      noValidate
    >
      <TranslationTabs>
        {(locale) => (
          <div className="flex flex-col gap-4">
            <FormField
              id={`edit-name-${locale}`}
              label={t('form.name')}
              error={locale === 'hy' && errors.nameHy ? t('validation.name') : undefined}
            >
              <Input
                id={`edit-name-${locale}`}
                placeholder={getProjectFormPlaceholder(locale, 'name')}
                {...register(locale === 'hy' ? 'nameHy' : locale === 'ru' ? 'nameRu' : 'nameEn')}
              />
            </FormField>
            <FormField id={`edit-short-${locale}`} label={t('form.shortDescription')}>
              <textarea
                id={`edit-short-${locale}`}
                rows={2}
                placeholder={getProjectFormPlaceholder(locale, 'shortDescription')}
                className="w-full rounded-sm border border-border bg-background px-4 py-3 text-base text-ink lg:text-sm focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
                {...register(
                  locale === 'hy'
                    ? 'shortDescriptionHy'
                    : locale === 'ru'
                      ? 'shortDescriptionRu'
                      : 'shortDescriptionEn',
                )}
              />
            </FormField>
            <FormField id={`edit-full-${locale}`} label={t('form.fullDescription')}>
              <textarea
                id={`edit-full-${locale}`}
                rows={4}
                placeholder={getProjectFormPlaceholder(locale, 'fullDescription')}
                className="w-full rounded-sm border border-border bg-background px-4 py-3 text-base text-ink lg:text-sm focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
                {...register(
                  locale === 'hy'
                    ? 'fullDescriptionHy'
                    : locale === 'ru'
                      ? 'fullDescriptionRu'
                      : 'fullDescriptionEn',
                )}
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField id={`edit-slug-${locale}`} label={t('form.slug')}>
                <Input
                  id={`edit-slug-${locale}`}
                  placeholder={getProjectFormPlaceholder(locale, 'slug')}
                  name={slugField.name}
                  ref={slugField.ref}
                  onBlur={slugField.onBlur}
                  onChange={(event) => {
                    lockSlugAuto();
                    void slugField.onChange(event);
                  }}
                />
              </FormField>
              <FormField id={`edit-location-${locale}`} label={t('form.locationText')}>
                <Input
                  id={`edit-location-${locale}`}
                  placeholder={getProjectFormPlaceholder(locale, 'locationText')}
                  {...register(
                    locale === 'hy'
                      ? 'locationTextHy'
                      : locale === 'ru'
                        ? 'locationTextRu'
                        : 'locationTextEn',
                  )}
                />
              </FormField>
              <FormField id={`edit-district-${locale}`} label={t('form.district')}>
                <Input
                  id={`edit-district-${locale}`}
                  placeholder={getProjectFormPlaceholder(locale, 'district')}
                  {...register('district')}
                />
              </FormField>
            </div>
          </div>
        )}
      </TranslationTabs>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField id="edit-type" label={t('form.projectType')}>
          <Input
            id="edit-type"
            placeholder={getProjectFormPlaceholder(siteLocale, 'projectType')}
            {...register('projectType')}
          />
        </FormField>
        <VerifiedStatusField id="edit-project-verified" control={control} name="verified" />
        <FormField id="edit-completion" label={t('form.completionDate')}>
          <Controller
            name="completionDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                id="edit-completion"
                name={field.name}
                value={field.value ?? ''}
                aria-label={t('form.completionDate')}
                onBlur={field.onBlur}
                onChange={field.onChange}
              />
            )}
          />
        </FormField>
      </div>

      <Controller
        control={control}
        name="coverMediaId"
        render={({ field, fieldState }) => (
          <MediaUploadField
            id="edit-project-cover"
            label={t('form.coverMedia')}
            context={mediaContext}
            value={field.value}
            onChange={(mediaAssetId) => {
              field.onChange(mediaAssetId);
              if (mediaAssetId.trim().length === 0) {
                setPreviewUrl(null);
              }
            }}
            onAssetSelected={(asset) => {
              field.onChange(asset.id);
              setPreviewUrl(asset.fileUrl);
            }}
            previewUrl={previewUrl ?? savedCover.url}
            error={fieldState.error?.message}
          />
        )}
      />

      <ProjectCatalogEditor
        register={register}
        control={control}
        setValue={setValue}
      />

      <FormSaveBar>
          {formError ? (
            <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2 text-sm text-danger">
              {formError}
            </p>
          ) : null}
          <Button
            type="submit"
            variant="secondary"
            className="w-full"
            disabled={busy || !isDirty}
          >
            {busy ? t('detail.saving') : t('detail.save')}
          </Button>
      </FormSaveBar>
    </form>
    {successToast}
    </>
  );
};
