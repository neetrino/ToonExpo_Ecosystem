'use client';

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type FocusEventHandler,
  type ReactNode,
  type RefObject,
} from 'react';

import { blurActiveElementAfterEscClose } from '@/shared/ui/blur-active-element';
import { cn } from '@/shared/ui/cn';
import { DropdownPortal } from '@/shared/ui/dropdown-portal';
import {
  ListboxMenuOptions,
  ListboxTrigger,
  type ListboxOption,
} from '@/shared/ui/listbox-select-menu';

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
  /** Dim the sheet behind a contained menu so it reads as a separate layer. */
  sheetScrim?: boolean | undefined;
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** Toggle several options without closing the menu. */
  multiple?: boolean | undefined;
  values?: readonly string[] | undefined;
  onValuesChange?: ((values: string[]) => void) | undefined;
  selectedCountLabel?: ((count: number) => string) | undefined;
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
      sheetScrim = false,
      open: openProp,
      onOpenChange,
      multiple = false,
      values,
      onValuesChange,
      selectedCountLabel,
    } = props;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const isOpenControlled = openProp !== undefined;
    const open = isOpenControlled ? openProp : uncontrolledOpen;
    const onOpenChangeRef = useRef(onOpenChange);
    onOpenChangeRef.current = onOpenChange;
    const rootRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const listId = useId();
    const isField = variant === 'field';
    const isFit = size === 'fit';
    const selectedIds = multiple ? [...(values ?? [])] : value.length > 0 ? [value] : [];
    const { label: triggerLabel, isPlaceholder: showPlaceholder } = resolveTriggerLabel(
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

    const menu = (
      <ListboxMenuOptions
        listId={listId}
        ariaLabel={ariaLabel}
        options={options}
        selectedIds={selectedIds}
        multiple={multiple}
        optionAction={optionAction}
        menuFooter={menuFooter}
        onPick={pick}
      />
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
        {open && !disabled && contained && sheetScrim ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label={ariaLabel}
            className="fixed inset-0 z-10 bg-ink/40"
            onClick={() => {
              setOpen(false);
            }}
          />
        ) : null}
        <div className={cn(contained && open && 'relative z-20')}>
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
          {contained ? (
            open && !disabled ? (
              <div
                ref={menuRef}
                className="site-select-menu site-select-menu--contained absolute top-[calc(100%+8px)] right-0 left-0 z-20"
              >
                {menu}
              </div>
            ) : null
          ) : (
            <DropdownPortal open={open && !disabled} anchorRef={buttonRef} matchWidth>
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

const MAX_INLINE_SELECTED_LABELS = 3;

const resolveTriggerLabel = (
  options: readonly ListboxOption[],
  selectedIds: readonly string[],
  placeholder: string | undefined,
  selectedCountLabel: ((count: number) => string) | undefined,
): { label: string; isPlaceholder: boolean } => {
  if (selectedIds.length === 0) {
    return {
      label: placeholder ?? options[0]?.label ?? '',
      isPlaceholder: Boolean(placeholder),
    };
  }

  const labels = selectedIds
    .map((id) => options.find((option) => option.value === id)?.label)
    .filter((label): label is string => label != null);

  if (labels.length === 1 && labels[0]) {
    return { label: labels[0], isPlaceholder: false };
  }
  if (labels.length > 0 && labels.length <= MAX_INLINE_SELECTED_LABELS) {
    return { label: labels.join(', '), isPlaceholder: false };
  }
  if (selectedCountLabel) {
    return { label: selectedCountLabel(selectedIds.length), isPlaceholder: false };
  }
  return { label: labels.join(', '), isPlaceholder: false };
};

const useListboxDismiss = (
  open: boolean,
  contained: boolean,
  rootRef: RefObject<HTMLDivElement | null>,
  menuRef: RefObject<HTMLDivElement | null>,
  setOpen: (open: boolean) => void,
): void => {
  const setOpenRef = useRef(setOpen);
  setOpenRef.current = setOpen;

  useEffect(() => {
    if (!open) {
      return;
    }

    const isInsideOpenMenu = (node: Node): boolean => {
      if (rootRef.current?.contains(node) || menuRef.current?.contains(node)) {
        return true;
      }
      if (node instanceof Element && menuRef.current) {
        const portal = node.closest('[data-dropdown-portal]');
        return Boolean(portal?.contains(menuRef.current));
      }
      return false;
    };

    const onPointerDown = (event: MouseEvent): void => {
      if (!isInsideOpenMenu(event.target as Node)) {
        setOpenRef.current(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      setOpenRef.current(false);
      blurActiveElementAfterEscClose();
    };

    const onScroll = (event: Event): void => {
      const target = event.target;
      if (target instanceof Node && isInsideOpenMenu(target)) {
        return;
      }
      setOpenRef.current(false);
      blurActiveElementAfterEscClose();
    };

    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown, true);
    if (!contained) {
      window.addEventListener('scroll', onScroll, true);
    }
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open, contained, rootRef, menuRef]);
};
