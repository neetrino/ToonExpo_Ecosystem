'use client';

import type { ServiceProviderCategoryItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useMemo, useState, type FocusEventHandler, type KeyboardEvent } from 'react';

import { useCreateServiceProviderCategoryMutation } from '@/features/admin/hooks/use-admin-service-providers';
import { SERVICE_PROVIDER_CATEGORY_NAME_MAX_LENGTH } from '@/features/admin/schemas/service-provider.schema';
import { ApiError } from '@/shared/api/errors';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { ListboxSelect } from '@/shared/ui/listbox-select';

type ServiceProviderCategorySelectProps = {
  id: string;
  categories: readonly ServiceProviderCategoryItem[];
  value: string;
  disabled?: boolean | undefined;
  onChange: (categoryId: string) => void;
  onBlur?: FocusEventHandler<HTMLButtonElement> | undefined;
};

type CreateErrorKey = 'categoriesNameTaken' | 'categoriesAddFailed';

type CategoryCreateFooterProps = {
  draftName: string;
  errorKey: CreateErrorKey | null;
  disabled: boolean;
  pending: boolean;
  onDraftNameChange: (value: string) => void;
  onSubmit: () => void;
};

const mergeCategories = (
  fromQuery: readonly ServiceProviderCategoryItem[],
  created: readonly ServiceProviderCategoryItem[],
): ServiceProviderCategoryItem[] => {
  const byId = new Map(fromQuery.map((category) => [category.id, category]));
  for (const category of created) {
    if (!byId.has(category.id)) {
      byId.set(category.id, category);
    }
  }
  return [...byId.values()];
};

const createErrorKey = (error: unknown): CreateErrorKey => {
  if (error instanceof ApiError && error.status === 409) {
    return 'categoriesNameTaken';
  }
  return 'categoriesAddFailed';
};

const CategoryCreateFooter = ({
  draftName,
  errorKey,
  disabled,
  pending,
  onDraftNameChange,
  onSubmit,
}: CategoryCreateFooterProps) => {
  const t = useTranslations('Admin.serviceProviders.providers.form');

  const onDraftKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    onSubmit();
  };

  return (
    <div className="site-select-menu-footer">
      <div className="flex items-center gap-1.5">
        <Input
          value={draftName}
          maxLength={SERVICE_PROVIDER_CATEGORY_NAME_MAX_LENGTH}
          placeholder={t('categoriesAddPlaceholder')}
          disabled={disabled || pending}
          aria-label={t('categoriesAddPlaceholder')}
          className="h-9 px-3"
          onChange={(event) => {
            onDraftNameChange(event.target.value);
          }}
          onKeyDown={onDraftKeyDown}
        />
        <Button
          type="button"
          size="sm"
          variant="soft"
          disabled={disabled || pending || draftName.trim().length === 0}
          onClick={onSubmit}
        >
          {pending ? t('saving') : t('categoriesAddSubmit')}
        </Button>
      </div>
      {errorKey ? <p className="mt-1.5 text-xs text-danger">{t(errorKey)}</p> : null}
    </div>
  );
};

/**
 * Category listbox with inline create — new names appear and select immediately.
 */
export const ServiceProviderCategorySelect = ({
  id,
  categories,
  value,
  disabled = false,
  onChange,
  onBlur,
}: ServiceProviderCategorySelectProps) => {
  const t = useTranslations('Admin.serviceProviders.providers.form');
  const createMutation = useCreateServiceProviderCategoryMutation();
  const [created, setCreated] = useState<ServiceProviderCategoryItem[]>([]);
  const [draftName, setDraftName] = useState('');
  const [errorKey, setErrorKey] = useState<CreateErrorKey | null>(null);

  const options = useMemo(
    () =>
      mergeCategories(categories, created)
        .filter((category) => category.active || category.id === value)
        .map((category) => ({ value: category.id, label: category.name })),
    [categories, created, value],
  );

  const submitCreate = async (): Promise<void> => {
    const name = draftName.trim();
    if (name.length === 0 || createMutation.isPending) {
      return;
    }

    try {
      const category = await createMutation.mutateAsync({ name, active: true });
      setCreated((current) => [...current, category]);
      setDraftName('');
      setErrorKey(null);
      onChange(category.id);
    } catch (error) {
      setErrorKey(createErrorKey(error));
    }
  };

  return (
    <ListboxSelect
      id={id}
      variant="field"
      value={value}
      options={options}
      disabled={disabled}
      placeholder={t('categoriesPlaceholder')}
      aria-label={t('categories')}
      onChange={onChange}
      onBlur={onBlur}
      menuFooter={
        <CategoryCreateFooter
          draftName={draftName}
          errorKey={errorKey}
          disabled={disabled}
          pending={createMutation.isPending}
          onDraftNameChange={(next) => {
            setDraftName(next);
            if (errorKey) {
              setErrorKey(null);
            }
          }}
          onSubmit={() => {
            void submitCreate();
          }}
        />
      }
    />
  );
};
