'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { useUpdateReadinessCriterionMutation } from '@/features/admin/hooks/use-admin-readiness';
import { useAdminServiceProviderCategoriesQuery } from '@/features/admin/hooks/use-admin-service-providers';
import { ListboxSelect } from '@/shared/ui/listbox-select';

const NONE_VALUE = '';

type ReadinessCriterionProviderSelectProps = {
  criterionId: string;
  value: string | null;
  disabled?: boolean | undefined;
};

/**
 * Compact catalog select — links a KPI criterion to a service provider category.
 */
export const ReadinessCriterionProviderSelect = ({
  criterionId,
  value,
  disabled = false,
}: ReadinessCriterionProviderSelectProps) => {
  const t = useTranslations('Admin.readiness.management');
  const categoriesQuery = useAdminServiceProviderCategoriesQuery();
  const mutation = useUpdateReadinessCriterionMutation();
  const [selected, setSelected] = useState(value ?? NONE_VALUE);
  const [error, setError] = useState(false);

  useEffect(() => {
    setSelected(value ?? NONE_VALUE);
  }, [value]);

  const options = useMemo(
    () => [
      { value: NONE_VALUE, label: t('providerCategoryNone') },
      ...(categoriesQuery.data?.data ?? [])
        .filter((category) => category.active || category.id === selected)
        .map((category) => ({ value: category.id, label: category.name })),
    ],
    [categoriesQuery.data?.data, selected, t],
  );

  const onChange = (next: string) => {
    const previous = selected;
    const nextId = next === NONE_VALUE ? null : next;
    setSelected(next);
    setError(false);
    mutation.mutate(
      { criterionId, body: { serviceProviderCategoryId: nextId } },
      {
        onError: () => {
          setSelected(previous);
          setError(true);
        },
      },
    );
  };

  return (
    <div className="w-40 shrink-0">
      <ListboxSelect
        id={`criterion-provider-${criterionId}`}
        variant="field"
        size="full"
        value={selected}
        options={options}
        disabled={disabled || mutation.isPending || categoriesQuery.isLoading}
        contained
        placeholder={t('providerCategory')}
        aria-label={t('providerCategory')}
        onChange={onChange}
      />
      {error ? (
        <p role="alert" className="mt-1 text-xs text-danger">
          {t('providerCategoryError')}
        </p>
      ) : null}
    </div>
  );
};
