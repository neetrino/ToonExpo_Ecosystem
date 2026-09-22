'use client';

import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { catalogMediaContext, catalogProjectDetailHref } from '@/features/builder/catalog-scope';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';

import { TranslationTabs } from '@/features/builder/components/translation-tabs';
import { getProjectFormPlaceholder } from '@/features/builder/constants/project-content-placeholders';
import { useAutoProjectSlug } from '@/features/builder/hooks/use-auto-project-slug';
import { useCreatePortalProjectMutation } from '@/features/builder/hooks/use-portal-projects';
import { useProjectFormErrorToast } from '@/features/builder/hooks/use-project-form-error-toast';
import {
  createProjectSchema,
  type CreateProjectFormValues,
} from '@/features/builder/schemas/project.schema';
import { projectLocaleField } from '@/features/builder/utils/project-locale-fields';
import { toCreateProjectRequest } from '@/features/builder/utils/project-mappers';
import { VerifiedStatusField } from '@/features/builder/components/verified-status-field';
import { MediaUploadField } from '@/features/media/components/media-upload-field';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { DatePicker } from '@/shared/ui/date-picker';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';

const emptyValues = (): CreateProjectFormValues => ({
  nameHy: '',
  nameRu: '',
  nameEn: '',
  slug: '',
  shortDescriptionHy: '',
  shortDescriptionRu: '',
  shortDescriptionEn: '',
  fullDescriptionHy: '',
  fullDescriptionRu: '',
  fullDescriptionEn: '',
  locationTextHy: '',
  locationTextRu: '',
  locationTextEn: '',
  address: '',
  city: '',
  districtHy: '',
  districtRu: '',
  districtEn: '',
  projectTypeHy: '',
  projectTypeRu: '',
  projectTypeEn: '',
  constructionStatus: '',
  completionDate: '',
  coverMediaId: '',
  verified: false,
});

type CreateProjectFormProps = {
  /** When set, called after create instead of navigating (sheet flow). */
  onCreated?: ((project: { id: string; slug: string }) => void) | undefined;
};

/**
 * Form to create a draft portal project with multilingual fields.
 */
export const CreateProjectForm = ({ onCreated }: CreateProjectFormProps = {}) => {
  const scope = useCatalogScope();
  const mediaContext = catalogMediaContext(scope);
  const t = useTranslations('Builder.projects');
  const siteLocale = useLocale();
  const router = useRouter();
  const createMutation = useCreatePortalProjectMutation();
  const { showError, onInvalid, errorToast, focusLocale, focusTick } =
    useProjectFormErrorToast();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: emptyValues(),
  });

  const { lockSlugAuto } = useAutoProjectSlug({
    control,
    getSlug: () => getValues('slug'),
    setSlug: (slug) =>
      setValue('slug', slug, { shouldDirty: true, shouldValidate: true }),
  });
  const slugField = register('slug');

  const onSubmit = handleSubmit(async (values) => {
    try {
      const project = await createMutation.mutateAsync(toCreateProjectRequest(values));
      if (onCreated) {
        onCreated({ id: project.id, slug: project.slug });
        return;
      }
      router.push(catalogProjectDetailHref(scope, project.id));
    } catch {
      showError(t('errors.generic'));
    }
  }, onInvalid);

  const busy = isSubmitting || createMutation.isPending;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <TranslationTabs focusLocale={focusLocale} focusTick={focusTick}>
        {(locale) => (
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id={`name-${locale}`}
                label={t('form.name')}
                error={locale === 'hy' && errors.nameHy ? t('validation.name') : undefined}
              >
                <Input
                  id={`name-${locale}`}
                  placeholder={getProjectFormPlaceholder(locale, 'name')}
                  aria-invalid={locale === 'hy' && Boolean(errors.nameHy)}
                  {...register(projectLocaleField('name', locale))}
                />
              </FormField>
              <FormField id={`projectType-${locale}`} label={t('form.projectType')}>
                <Input
                  id={`projectType-${locale}`}
                  placeholder={getProjectFormPlaceholder(locale, 'projectType')}
                  {...register(projectLocaleField('projectType', locale))}
                />
              </FormField>
            </div>
            <FormField id={`short-${locale}`} label={t('form.shortDescription')}>
              <textarea
                id={`short-${locale}`}
                rows={2}
                placeholder={getProjectFormPlaceholder(locale, 'shortDescription')}
                className="w-full rounded-sm border border-border bg-background px-4 py-3 text-base text-ink lg:text-sm focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
                {...register(projectLocaleField('shortDescription', locale))}
              />
            </FormField>
            <FormField id={`full-${locale}`} label={t('form.fullDescription')}>
              <textarea
                id={`full-${locale}`}
                rows={4}
                placeholder={getProjectFormPlaceholder(locale, 'fullDescription')}
                className="w-full rounded-sm border border-border bg-background px-4 py-3 text-base text-ink lg:text-sm focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
                {...register(projectLocaleField('fullDescription', locale))}
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id={`location-${locale}`} label={t('form.locationText')}>
                <Input
                  id={`location-${locale}`}
                  placeholder={getProjectFormPlaceholder(locale, 'locationText')}
                  {...register(projectLocaleField('locationText', locale))}
                />
              </FormField>
              <FormField id={`district-${locale}`} label={t('form.district')}>
                <Input
                  id={`district-${locale}`}
                  placeholder={getProjectFormPlaceholder(locale, 'district')}
                  {...register(projectLocaleField('district', locale))}
                />
              </FormField>
            </div>
          </div>
        )}
      </TranslationTabs>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold text-ink">{t('form.detailsSection')}</legend>
        <FormField id="slug" label={t('form.slug')}>
          <Input
            id="slug"
            placeholder={getProjectFormPlaceholder(siteLocale, 'slug')}
            name={slugField.name}
            ref={slugField.ref}
            onBlur={slugField.onBlur}
            onChange={(event) => {
              lockSlugAuto();
              void slugField.onChange(event);
            }}
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <VerifiedStatusField id="project-verified" control={control} name="verified" />
          <FormField id="constructionStatus" label={t('form.constructionStatus')}>
            <Input
              id="constructionStatus"
              placeholder={getProjectFormPlaceholder(siteLocale, 'constructionStatus')}
              {...register('constructionStatus')}
            />
          </FormField>
          <FormField id="completionDate" label={t('form.completionDate')}>
            <Controller
              name="completionDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  id="completionDate"
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
      </fieldset>

      <Controller
        control={control}
        name="coverMediaId"
        render={({ field, fieldState }) => (
          <MediaUploadField
            id="project-cover"
            label={t('form.coverMedia')}
            context={mediaContext}
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      <Button type="submit" variant="secondary" disabled={busy}>
        {busy ? t('form.submitting') : t('form.submit')}
      </Button>
      {errorToast}
    </form>
  );
};
