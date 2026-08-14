'use client';

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type FocusEventHandler,
  type ReactNode,
} from 'react';

import { cn } from '@/shared/ui/cn';
import { DropdownPortal } from '@/shared/ui/dropdown-portal';
import {
  ContainedListboxMenu,
  ListboxComboboxField,
  ListboxMenuOptions,
  ListboxTrigger,
  type ListboxOption,
} from '@/shared/ui/listbox-select-menu';
import { resolveListboxTriggerLabel } from '@/shared/ui/resolve-listbox-trigger-label';
import { useListboxDismiss } from '@/shared/ui/use-listbox-dismiss';

export type { ListboxOption };

export type ListboxSelectProps = {
  value?: string | undefined;
  options: readonly ListboxOption[];
  onChange?: ((value: string) => void) | undefined;
  /** Accessible name when the visible field label is separate. */
  'aria-label': string;
  className?: string | undefined;
  name?: string | undefined;
  id?: string | undefined;
  disabled?: boolean | undefined;
  /** `plain` = hero search; `field` = bordered form control. Menu chrome matches home. */
  variant?: 'plain' | 'field' | undefined;
  /** `full` stretches; `fit` matches dropdown width (chevron on the menu’s right edge). */
  size?: 'full' | 'fit' | undefined;
  onBlur?: FocusEventHandler<HTMLButtonElement> | undefined;
  /** Shown on the trigger when `value` matches no option (not added as a menu row). */
  placeholder?: string | undefined;
  /** Extra content inside the menu panel (e.g. inline create). */
  menuFooter?: ReactNode | undefined;
  /** Optional trailing control per option (e.g. delete). */
  optionAction?: ((option: ListboxOption) => ReactNode) | undefined;
  /** Render the menu in-place (no stage portal) — stays inside a side sheet. */
  contained?: boolean | undefined;
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** Toggle several options without closing the menu. */
  multiple?: boolean | undefined;
  values?: readonly string[] | undefined;
  onValuesChange?: ((values: string[]) => void) | undefined;
  selectedCountLabel?: ((count: number) => string) | undefined;
  /** Combobox: type in the field to filter, pick from the list. */
  searchable?: boolean | undefined;
  searchPlaceholder?: string | undefined;
  emptyLabel?: string | undefined;
};

/**
 * Custom listbox — soft panel + check, same family as LocaleSwitcher / ma-marie menus.
 * Default menu portals to the desktop stage. `contained` keeps it on a side sheet.
 */
export const ListboxSelect = forwardRef<HTMLButtonElement, ListboxSelectProps>(
  function ListboxSelect(props, ref) {
    const {
      value = '',
      options,
      onChange,
      'aria-label': ariaLabel,
      className,
      name,
      id,
      disabled = false,
      variant = 'plain',
      size = 'full',
      onBlur,
      placeholder,
      menuFooter,
      optionAction,
      contained = false,
      open: openProp,
      onOpenChange,
      multiple = false,
      values,
      onValuesChange,
      selectedCountLabel,
      searchable = false,
      searchPlaceholder,
      emptyLabel,
    } = props;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const isOpenControlled = openProp !== undefined;
    const open = isOpenControlled ? openProp : uncontrolledOpen;
    const onOpenChangeRef = useRef(onOpenChange);
    onOpenChangeRef.current = onOpenChange;
    const rootRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const fieldWrapRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const listId = useId();
    const isField = variant === 'field';
    const isFit = size === 'fit';
    const selectedIds = multiple ? [...(values ?? [])] : value.length > 0 ? [value] : [];
    const { label: triggerLabel, isPlaceholder: showPlaceholder } = resolveListboxTriggerLabel(
      options,
      selectedIds,
      placeholder,
      selectedCountLabel,
    );

    const setOpen = (next: boolean | ((current: boolean) => boolean)): void => {
      const resolved = typeof next === 'function' ? next(open) : next;
      if (!isOpenControlled) {
        setUncontrolledOpen(resolved);
      }
      onOpenChangeRef.current?.(resolved);
    };

    useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement);
    useListboxDismiss(open, contained, rootRef, menuRef, setOpen);

    useEffect(() => {
      if (!open) {
        setSearchQuery('');
        return;
      }
      if (searchable) {
        searchInputRef.current?.focus();
      }
    }, [open, searchable]);

    const visibleOptions = useMemo(() => {
      if (!searchable) {
        return options;
      }
      const needle = searchQuery.trim().toLowerCase();
      if (!needle) {
        return options;
      }
      return options.filter((option) => option.label.toLowerCase().includes(needle));
    }, [options, searchQuery, searchable]);

    const pick = (next: string): void => {
      if (disabled) {
        return;
      }
      if (multiple && onValuesChange) {
        const nextValues = selectedIds.includes(next)
          ? selectedIds.filter((id) => id !== next)
          : [...selectedIds, next];
        onValuesChange(nextValues);
        return;
      }
      onChange?.(next);
      setOpen(false);
    };

    const comboboxValue = open ? searchQuery : showPlaceholder ? '' : triggerLabel;
    const comboboxPlaceholder = searchPlaceholder ?? placeholder ?? '';

    const menu = (
      <>
        {visibleOptions.length === 0 ? (
          <p className="px-3 py-2 text-sm text-ink-muted">{emptyLabel}</p>
        ) : (
          <ListboxMenuOptions
            listId={listId}
            ariaLabel={ariaLabel}
            options={visibleOptions}
            selectedIds={selectedIds}
            multiple={multiple}
            optionAction={optionAction}
            menuFooter={menuFooter}
            onPick={pick}
          />
        )}
      </>
    );

    return (
      <div
        ref={rootRef}
        className={cn(
          'relative min-w-0',
          isField && (isFit ? 'inline-grid max-w-full' : 'block w-full'),
          !isField && isFit && 'inline-grid max-w-full',
          !isField && !isFit && 'block',
          !isField && className,
        )}
      >
        {name ? (
          <input
            type="hidden"
            name={name}
            value={multiple ? selectedIds.join(',') : value}
            disabled={disabled}
          />
        ) : null}
        <div ref={fieldWrapRef} className={cn(contained && 'relative z-20')}>
          {searchable ? (
            <ListboxComboboxField
              inputRef={searchInputRef}
              id={id}
              disabled={disabled}
              open={open}
              listId={listId}
              value={comboboxValue}
              placeholder={comboboxPlaceholder}
              ariaLabel={ariaLabel}
              className={className}
              onFocus={() => {
                if (!disabled) {
                  setOpen(true);
                }
              }}
              onChange={(next) => {
                setSearchQuery(next);
                if (!disabled) {
                  setOpen(true);
                }
              }}
            />
          ) : (
            <ListboxTrigger
              buttonRef={buttonRef}
              id={id}
              disabled={disabled}
              open={open}
              isField={isField}
              isFit={isFit}
              className={className}
              ariaLabel={ariaLabel}
              listId={listId}
              triggerLabel={triggerLabel}
              showPlaceholder={showPlaceholder}
              onBlur={onBlur}
              onToggle={() => {
                if (!disabled) {
                  setOpen((current) => !current);
                }
              }}
            />
          )}
          {contained ? (
            <ContainedListboxMenu open={open && !disabled} menuRef={menuRef}>
              {menu}
            </ContainedListboxMenu>
          ) : (
            <DropdownPortal
              open={open && !disabled}
              anchorRef={searchable ? fieldWrapRef : buttonRef}
              matchWidth
            >
              <div ref={menuRef} className="site-select-menu">
                {menu}
              </div>
            </DropdownPortal>
          )}
        </div>
      </div>
    );
  },
);
