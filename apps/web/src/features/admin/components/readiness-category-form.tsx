'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ReadinessCategoryItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  readinessCategorySchema,
  type ReadinessCategoryFormValues,
} from '@/features/admin/schemas/readiness.schema';
import {
  useCreateReadinessCategoryMutation,
  useUpdateReadinessCategoryMutation,
} from '@/features/admin/hooks/use-admin-readiness';
import {
  READINESS_CATEGORY_WEIGHT_MAX,
  READINESS_CATEGORY_WEIGHT_MIN,
} from '@/features/readiness/constants';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

type ReadinessCategoryFormProps = {
  category?: ReadinessCategoryItem;
  onDone: () => void;
};

/**
 * Create or edit readiness category fields.
 */
export const ReadinessCategoryForm = ({ category, onDone }: ReadinessCategoryFormProps) => {
  const t = useTranslations('Admin.readiness.categories');
  const createMutation = useCreateReadinessCategoryMutation();
  const updateMutation = useUpdateReadinessCategoryMutation(category?.id ?? '');
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ReadinessCategoryFormValues>({
    resolver: zodResolver(readinessCategorySchema),
    defaultValues: {
      name: category?.name ?? '',
      description: category?.description ?? '',
      weight:
        category?.weight === null || category?.weight === undefined ? '' : String(category.weight),
      sortOrder: category?.sortOrder ?? 0,
      active: category?.active ?? true,
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        description: category.description ?? '',
        weight:
          category.weight === null || category.weight === undefined ? '' : String(category.weight),
        sortOrder: category.sortOrder,
        active: category.active,
      });
    }
  }, [category, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    const trimmedWeight = values['weight'].trim();
    let parsedWeight: number | undefined;
    if (trimmedWeight.length > 0) {
      parsedWeight = Number.parseInt(trimmedWeight, 10);
      if (
        Number.isNaN(parsedWeight) ||
        parsedWeight < READINESS_CATEGORY_WEIGHT_MIN ||
        parsedWeight > READINESS_CATEGORY_WEIGHT_MAX
      ) {
        form.setError('weight', { message: t('validation.weight') });
        return;
      }
    }

    try {
      const payload = {
        name: values['name'],
        sortOrder: values['sortOrder'],
        active: values['active'],
        ...(values['description'].length > 0 ? { description: values['description'] } : {}),
        ...(parsedWeight !== undefined ? { weight: parsedWeight } : {}),
      };

      if (category) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }
      onDone();
    } catch {
      setError(t('errors.generic'));
    }
  });

  const busy = createMutation.isPending || updateMutation.isPending;

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <FormField
        id="category-name"
        label={t('form.name')}
        error={form.formState.errors.name ? t('validation.name') : undefined}
      >
        <Input id="category-name" {...form.register('name')} />
      </FormField>

      <FormField id="category-description" label={t('form.description')}>
        <Textarea id="category-description" rows={3} {...form.register('description')} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="category-weight"
          label={t('form.weight')}
          error={form.formState.errors.weight ? t('validation.weight') : undefined}
        >
          <Input
            id="category-weight"
            type="number"
            min={1}
            max={100}
            {...form.register('weight')}
          />
        </FormField>

        <FormField id="category-sort" label={t('form.sortOrder')}>
          <Input
            id="category-sort"
            type="number"
            min={0}
            {...form.register('sortOrder', { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" {...form.register('active')} />
        {t('form.active')}
      </label>

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" variant="primary" disabled={busy}>
          {busy ? t('form.saving') : t('form.save')}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}>
          {t('form.cancel')}
        </Button>
      </div>
    </form>
  );
};
