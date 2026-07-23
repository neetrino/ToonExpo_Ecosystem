'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { CompanyResponse } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useAdminCompanyProjectsQuery } from '@/features/admin/hooks/use-admin-companies';
import { useCreateReadinessAssessmentMutation } from '@/features/admin/hooks/use-admin-readiness';
import {
  createReadinessAssessmentSchema,
  type CreateReadinessAssessmentFormValues,
} from '@/features/admin/schemas/readiness.schema';
import { READINESS_TARGET_TYPES } from '@/features/readiness/constants';
import { useRouter } from '@/i18n/navigation';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Select } from '@/shared/ui/select';

type ReadinessCreateAssessmentSheetProps = {
  open: boolean;
  companies: CompanyResponse[];
  onClose: () => void;
};

/**
 * Side sheet to create a readiness assessment for a company or project.
 */
export const ReadinessCreateAssessmentSheet = ({
  open,
  companies,
  onClose,
}: ReadinessCreateAssessmentSheetProps) => {
  const t = useTranslations('Admin.readiness.assessments');
  const router = useRouter();
  const mutation = useCreateReadinessAssessmentMutation();

  const form = useForm<CreateReadinessAssessmentFormValues>({
    resolver: zodResolver(createReadinessAssessmentSchema),
    defaultValues: {
      targetType: 'builder_company',
      builderCompanyId: '',
      projectId: '',
    },
  });

  const targetType = form.watch('targetType');
  const builderCompanyId = form.watch('builderCompanyId');
  const projectsQuery = useAdminCompanyProjectsQuery(builderCompanyId, targetType === 'project');

  useEffect(() => {
    form.setValue('projectId', '');
  }, [builderCompanyId, form]);

  const handleClose = (): void => {
    onClose();
    form.reset();
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await mutation.mutateAsync({
        targetType: values.targetType,
        builderCompanyId: values.builderCompanyId,
        ...(values.targetType === 'project' ? { projectId: values.projectId } : {}),
      });
      handleClose();
      router.push(`/admin/readiness/${result.id}`);
    } catch {
      form.setError('root', { message: t('errors.generic') });
    }
  });

  const projectSelectDisabled = builderCompanyId.length === 0 || projectsQuery.isLoading;

  return (
    <AdminCreateSheet open={open} onClose={handleClose} title={t('create.title')}>
      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <FormField id="targetType" label={t('create.targetType')}>
          <Controller
            name="targetType"
            control={form.control}
            render={({ field }) => (
              <Select
                id="targetType"
                name={field.name}
                value={field.value}
                aria-label={t('create.targetType')}
                onBlur={field.onBlur}
                onChange={(event) => {
                  field.onChange(event.target.value);
                }}
              >
                {READINESS_TARGET_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`targetTypes.${type}`)}
                  </option>
                ))}
              </Select>
            )}
          />
        </FormField>

        <FormField
          id="builderCompanyId"
          label={t('create.company')}
          error={form.formState.errors.builderCompanyId ? t('validation.company') : undefined}
        >
          <Controller
            name="builderCompanyId"
            control={form.control}
            render={({ field }) => (
              <Select
                id="builderCompanyId"
                name={field.name}
                value={field.value}
                aria-label={t('create.company')}
                onBlur={field.onBlur}
                onChange={(event) => {
                  field.onChange(event.target.value);
                }}
              >
                <option value="">{t('create.selectCompany')}</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </Select>
            )}
          />
        </FormField>

        {targetType === 'project' ? (
          <FormField
            id="projectId"
            label={t('create.project')}
            error={form.formState.errors.projectId ? t('validation.project') : undefined}
          >
            <Controller
              name="projectId"
              control={form.control}
              render={({ field }) => (
                <Select
                  id="projectId"
                  name={field.name}
                  value={field.value}
                  aria-label={t('create.project')}
                  disabled={projectSelectDisabled}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    field.onChange(event.target.value);
                  }}
                >
                  <option value="">
                    {builderCompanyId.length === 0
                      ? t('create.selectCompanyFirst')
                      : projectsQuery.isLoading
                        ? t('create.loadingProjects')
                        : t('create.selectProject')}
                  </option>
                  {(projectsQuery.data?.data ?? []).map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({t(`create.publicationStatuses.${project.publicationStatus}`)}
                      )
                    </option>
                  ))}
                </Select>
              )}
            />
            {builderCompanyId.length === 0 ? (
              <p className="mt-1 text-xs text-ink-muted">{t('create.selectCompanyFirst')}</p>
            ) : null}
            {projectsQuery.isError ? (
              <p role="alert" className="mt-1 text-xs text-danger">
                {t('create.projectsError')}
              </p>
            ) : null}
            {projectsQuery.isSuccess && projectsQuery.data.data.length === 0 ? (
              <p className="mt-1 text-xs text-ink-muted">{t('create.noProjects')}</p>
            ) : null}
          </FormField>
        ) : null}

        {form.formState.errors.root?.message ? (
          <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2 text-sm text-danger">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <Button type="submit" variant="primary" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? t('create.submitting') : t('create.submit')}
        </Button>
      </form>
    </AdminCreateSheet>
  );
};
