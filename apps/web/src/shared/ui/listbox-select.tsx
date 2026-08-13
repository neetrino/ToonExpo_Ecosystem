'use client';

import { Check, ChevronDown } from 'lucide-react';
import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type FocusEventHandler,
  type ReactNode,
} from 'react';

import { blurActiveElementAfterEscClose } from '@/shared/ui/blur-active-element';
import { cn } from '@/shared/ui/cn';
import { DropdownPortal } from '@/shared/ui/dropdown-portal';

export type ListboxOption = {
  value: string;
  label: string;
};

export type ListboxSelectProps = {
  value: string;
  options: readonly ListboxOption[];
  onChange: (value: string) => void;
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
};

/**
 * Custom listbox — soft panel + check, same family as LocaleSwitcher / ma-marie menus.
 * Menu portals to `document.body` so it stacks above page chrome.
 * Fit width uses CSS grid (no inline width styles).
 */
export const ListboxSelect = forwardRef<HTMLButtonElement, ListboxSelectProps>(
  function ListboxSelect(
    {
      value,
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
    },
    ref,
  ) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const listId = useId();
    const isField = variant === 'field';
    const isFit = size === 'fit';
    const selected = options.find((option) => option.value === value);
    const triggerLabel = selected?.label ?? placeholder ?? options[0]?.label ?? '';
    const showPlaceholder = selected == null && Boolean(placeholder);

    useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement);

    useEffect(() => {
      if (!open) {
        return;
      }

      const isInsideOpenMenu = (node: Node): boolean => {
        if (rootRef.current?.contains(node)) {
          return true;
        }
        if (menuRef.current?.contains(node)) {
          return true;
        }
        // Scroll/overflow lives on DropdownPortal wrapper, not the <ul>.
        if (node instanceof Element && menuRef.current) {
          const portal = node.closest('[data-dropdown-portal]');
          return Boolean(portal?.contains(menuRef.current));
        }
        return false;
      };

      const onPointerDown = (event: MouseEvent): void => {
        if (isInsideOpenMenu(event.target as Node)) {
          return;
        }
        setOpen(false);
      };

      const onKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
          setOpen(false);
          blurActiveElementAfterEscClose();
        }
      };

      const onScroll = (event: Event): void => {
        const target = event.target;
        if (target instanceof Node && isInsideOpenMenu(target)) {
          return;
        }
        setOpen(false);
        blurActiveElementAfterEscClose();
      };

      document.addEventListener('mousedown', onPointerDown);
      document.addEventListener('keydown', onKeyDown);
      window.addEventListener('scroll', onScroll, true);
      return () => {
        document.removeEventListener('mousedown', onPointerDown);
        document.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('scroll', onScroll, true);
      };
    }, [open]);

    const pick = (next: string): void => {
      if (disabled) {
        return;
      }
      onChange(next);
      setOpen(false);
    };

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
        {name ? <input type="hidden" name={name} value={value} disabled={disabled} /> : null}
        {isFit ? (
          <ul aria-hidden className="invisible col-start-1 row-start-1 h-0 overflow-hidden">
            {options.map((option) => (
              <li key={option.value}>
                <span
                  className={cn(
                    'flex items-center justify-between gap-2 whitespace-nowrap',
                    isField ? 'px-4 text-base sm:text-sm' : 'text-sm font-medium',
                  )}
                >
                  <span>{option.label}</span>
                  <ChevronDown className="size-4 shrink-0" aria-hidden />
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        <button
          ref={buttonRef}
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            'col-start-1 row-start-1',
            isField
              ? cn('site-select-trigger', className)
              : cn(
                  'flex min-w-0 w-full items-center justify-between gap-2 bg-transparent p-0 text-left',
                  'text-sm font-medium text-ink-navy transition-colors duration-[var(--duration-fast)]',
                  'hover:text-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  open && 'text-brand-deep',
                ),
          )}
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onBlur={onBlur}
          onClick={() => {
            if (disabled) {
              return;
            }
            setOpen((current) => !current);
          }}
        >
          <span
            className={cn(
              isField ? 'site-select-trigger__label' : isFit ? 'whitespace-nowrap' : 'truncate',
              showPlaceholder && 'text-ink-muted',
            )}
          >
            {triggerLabel}
          </span>
          <ChevronDown
            className={cn(
              isField
                ? 'site-select-trigger__chevron'
                : cn(
                    'size-4 shrink-0 text-header-muted transition-transform duration-[var(--duration-base)]',
                    'ease-[var(--ease-out-premium)]',
                    open && 'rotate-180 text-brand-deep',
                  ),
            )}
            aria-hidden
          />
        </button>

        <DropdownPortal open={open && !disabled} anchorRef={buttonRef} matchWidth>
          <div ref={menuRef} className="site-select-menu">
            <ul id={listId} role="listbox" aria-label={ariaLabel}>
              {options.map((option) => (
                <ListboxOptionItem
                  key={option.value}
                  option={option}
                  active={option.value === value}
                  action={optionAction?.(option)}
                  onPick={pick}
                />
              ))}
            </ul>
            {menuFooter}
          </div>
        </DropdownPortal>
      </div>
    );
  },
);

type ListboxOptionItemProps = {
  option: ListboxOption;
  active: boolean;
  action: ReactNode | undefined;
  onPick: (value: string) => void;
};

const ListboxOptionItem = ({ option, active, action, onPick }: ListboxOptionItemProps) => {
  const control = (
    <button
      type="button"
      role="option"
      aria-selected={active}
      className="site-select-option"
      onClick={() => {
        onPick(option.value);
      }}
    >
      <span>{option.label}</span>
      {active ? <Check className="site-select-option__check" aria-hidden /> : null}
    </button>
  );

  if (!action) {
    return <li role="none">{control}</li>;
  }

  return (
    <li role="none" className="site-select-option-row">
      {control}
      <div className="site-select-option-row__action">{action}</div>
    </li>
  );
};
