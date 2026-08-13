'use client';

import type { ServiceProviderCategoryItem } from '@toonexpo/contracts';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState, type FocusEventHandler, type KeyboardEvent, type MouseEvent } from 'react';

import {
  useCreateServiceProviderCategoryMutation,
  useDeleteServiceProviderCategoryMutation,
} from '@/features/admin/hooks/use-admin-service-providers';
import { SERVICE_PROVIDER_CATEGORY_NAME_MAX_LENGTH } from '@/features/admin/schemas/service-provider.schema';
import { ApiError } from '@/shared/api/errors';
import { AdminDeleteModal } from '@/shared/ui/admin-delete-modal';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { ListboxSelect, type ListboxOption } from '@/shared/ui/listbox-select';

type ServiceProviderCategorySelectProps = {
  id: string;
  categories: readonly ServiceProviderCategoryItem[];
  value: string;
  disabled?: boolean | undefined;
  onChange: (categoryId: string) => void;
  onBlur?: FocusEventHandler<HTMLButtonElement> | undefined;
};

type FormErrorKey = 'categoriesNameTaken' | 'categoriesAddFailed' | 'categoriesDeleteFailed';

const DELETE_CONFIRM_OPEN_DELAY_MS = 50;

type PendingDelete = {
  id: string;
  name: string;
};

type CategoryCreateFooterProps = {
  draftName: string;
  errorKey: FormErrorKey | null;
  disabled: boolean;
  pending: boolean;
  onDraftNameChange: (value: string) => void;
  onSubmit: () => void;
};

const visibleCategories = (
  fromQuery: readonly ServiceProviderCategoryItem[],
  created: readonly ServiceProviderCategoryItem[],
  removedIds: ReadonlySet<string>,
): ServiceProviderCategoryItem[] => {
  const byId = new Map(fromQuery.map((category) => [category.id, category]));
  for (const category of created) {
    if (!byId.has(category.id)) {
      byId.set(category.id, category);
    }
  }
  return [...byId.values()].filter((category) => !removedIds.has(category.id));
};

const createErrorKey = (error: unknown): FormErrorKey => {
  if (error instanceof ApiError && error.status === 409) {
    return 'categoriesNameTaken';
  }
  return 'categoriesAddFailed';
};

const stopRowAction = (event: MouseEvent<HTMLButtonElement>): void => {
  event.preventDefault();
  event.stopPropagation();
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
 * Category listbox with inline create/delete — changes appear in the list immediately.
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
  const tCategory = useTranslations('Admin.serviceProviders.categories.form');
  const createMutation = useCreateServiceProviderCategoryMutation();
  const deleteMutation = useDeleteServiceProviderCategoryMutation();
  const [created, setCreated] = useState<ServiceProviderCategoryItem[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [draftName, setDraftName] = useState('');
  const [errorKey, setErrorKey] = useState<FormErrorKey | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const removedIdSet = useMemo(() => new Set(removedIds), [removedIds]);
  const options = useMemo(
    () =>
      visibleCategories(categories, created, removedIdSet)
        .filter((category) => category.active || category.id === value)
        .map((category) => ({ value: category.id, label: category.name })),
    [categories, created, removedIdSet, value],
  );

  const submitCreate = async (): Promise<void> => {
    const name = draftName.trim();
    if (name.length === 0 || createMutation.isPending) {
      return;
    }

    try {
      const category = await createMutation.mutateAsync({ name, active: true });
      setCreated((current) => [...current, category]);
      setRemovedIds((current) => current.filter((categoryId) => categoryId !== category.id));
      setDraftName('');
      setErrorKey(null);
      onChange(category.id);
    } catch (error) {
      setErrorKey(createErrorKey(error));
    }
  };

  const confirmDelete = async (): Promise<void> => {
    if (!pendingDelete || deleteMutation.isPending) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(pendingDelete.id);
      const deletedId = pendingDelete.id;
      setCreated((current) => current.filter((category) => category.id !== deletedId));
      setRemovedIds((current) =>
        current.includes(deletedId) ? current : [...current, deletedId],
      );
      setPendingDelete(null);
      setErrorKey(null);
      if (value === deletedId) {
        onChange('');
      }
    } catch {
      setErrorKey('categoriesDeleteFailed');
      setPendingDelete(null);
    }
  };

  const optionAction = (option: ListboxOption) => (
    <button
      type="button"
      className="rounded-sm p-1 text-ink-muted transition-colors hover:bg-danger-soft hover:text-danger"
      aria-label={t('categoriesDelete')}
      disabled={disabled || deleteMutation.isPending}
      onMouseDown={stopRowAction}
      onClick={(event) => {
        stopRowAction(event);
        setMenuOpen(false);
        const nextDelete = { id: option.value, name: option.label };
        window.setTimeout(() => {
          setPendingDelete(nextDelete);
        }, DELETE_CONFIRM_OPEN_DELAY_MS);
      }}
    >
      <Trash2 className="size-3.5" strokeWidth={1.75} aria-hidden />
    </button>
  );

  return (
    <>
      <ListboxSelect
        id={id}
        variant="field"
        value={value}
        options={options}
        disabled={disabled}
        contained
        sheetScrim
        open={menuOpen && pendingDelete == null}
        placeholder={t('categoriesPlaceholder')}
        aria-label={t('categories')}
        onChange={onChange}
        onBlur={onBlur}
        onOpenChange={setMenuOpen}
        optionAction={optionAction}
        menuFooter={
          <CategoryCreateFooter
            draftName={draftName}
            errorKey={errorKey}
            disabled={disabled}
            pending={createMutation.isPending || deleteMutation.isPending}
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
      <AdminDeleteModal
        open={pendingDelete != null}
        title={tCategory('deleteConfirmTitle')}
        message={pendingDelete ? tCategory('deleteConfirmMessage', { name: pendingDelete.name }) : ''}
        confirming={deleteMutation.isPending}
        onCancel={() => {
          if (!deleteMutation.isPending) {
            setPendingDelete(null);
          }
        }}
        onConfirm={() => {
          void confirmDelete();
        }}
      />
    </>
  );
};
