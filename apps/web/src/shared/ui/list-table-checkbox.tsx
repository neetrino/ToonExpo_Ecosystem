'use client';

import { useTranslations } from 'next-intl';
import type { ChangeEvent, MouseEvent } from 'react';

import { cn } from '@/shared/ui/cn';

const CHECKBOX_CLASS =
  'size-4 shrink-0 cursor-pointer rounded border border-border accent-brand disabled:cursor-not-allowed disabled:opacity-40';

type ListTableSelectAllCheckboxProps = {
  checked: boolean;
  indeterminate?: boolean | undefined;
  disabled?: boolean | undefined;
  onChange: () => void;
};

/**
 * Header checkbox for select-all on the current list page.
 */
export const ListTableSelectAllCheckbox = ({
  checked,
  indeterminate = false,
  disabled = false,
  onChange,
}: ListTableSelectAllCheckboxProps) => {
  const t = useTranslations('Common.listSelection');

  return (
    <th className="w-10 px-2 py-2.5 text-left font-medium">
      <input
        type="checkbox"
        className={CHECKBOX_CLASS}
        checked={checked}
        disabled={disabled}
        aria-label={t('selectAll')}
        ref={(node) => {
          if (node) {
            node.indeterminate = indeterminate && !checked;
          }
        }}
        onChange={() => {
          onChange();
        }}
        onClick={(event: MouseEvent<HTMLInputElement>) => {
          event.stopPropagation();
        }}
      />
    </th>
  );
};

type ListTableRowCheckboxProps = {
  checked: boolean;
  disabled?: boolean | undefined;
  onChange: () => void;
  label?: string | undefined;
};

/**
 * Row checkbox — stops click so row navigation does not fire.
 */
export const ListTableRowCheckbox = ({
  checked,
  disabled = false,
  onChange,
  label,
}: ListTableRowCheckboxProps) => {
  const t = useTranslations('Common.listSelection');

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    event.stopPropagation();
    onChange();
  };

  return (
    <td
      className={cn('w-10 px-2 py-2.5 align-middle')}
      onClick={(event: MouseEvent<HTMLTableCellElement>) => {
        event.stopPropagation();
      }}
    >
      <input
        type="checkbox"
        className={CHECKBOX_CLASS}
        checked={checked}
        disabled={disabled}
        aria-label={label ?? t('selectRow')}
        onChange={handleChange}
        onClick={(event: MouseEvent<HTMLInputElement>) => {
          event.stopPropagation();
        }}
      />
    </td>
  );
};
