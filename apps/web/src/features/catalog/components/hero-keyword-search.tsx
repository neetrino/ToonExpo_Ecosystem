import type { ProjectListItem } from '@toonexpo/contracts';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';

import {
  HERO_FILTER_PANEL_CLASS,
  heroFilterOptionStateClass,
} from '@/features/catalog/components/hero-filter-menu-styles';
import {
  HERO_KEYWORD_BLUR_CLOSE_DELAY_MS,
  HERO_KEYWORD_MIN_QUERY_LENGTH,
} from '@/features/catalog/constants/hero-search';
import type { HeroSearchSuggestion } from '@/features/catalog/utils/build-hero-search-suggestions';
import { buildHeroSearchSuggestions } from '@/features/catalog/utils/build-hero-search-suggestions';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type HeroKeywordSearchProps = {
  value: string;
  projects: readonly ProjectListItem[];
  onChange: (value: string) => void;
  className?: string | undefined;
};

/**
 * Hero keyword field — search icon + project/builder/city suggestions.
 */
export const HeroKeywordSearch = ({
  value,
  projects,
  onChange,
  className,
}: HeroKeywordSearchProps) => {
  const t = useTranslations('HomePage.hero');
  const router = useRouter();
  const listboxId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const blurCloseTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (blurCloseTimerRef.current !== null) {
        window.clearTimeout(blurCloseTimerRef.current);
      }
    };
  }, []);

  const suggestions = useMemo(
    () => buildHeroSearchSuggestions(projects, value),
    [projects, value],
  );

  const canSuggest = value.trim().length >= HERO_KEYWORD_MIN_QUERY_LENGTH;
  const showPanel = isOpen && canSuggest;
  const showEmpty = showPanel && suggestions.length === 0;
  const activeOptionId =
    showPanel && suggestions[activeIndex]
      ? `${listboxId}-option-${suggestions[activeIndex].id}`
      : undefined;

  const selectAt = (index: number): void => {
    const suggestion = suggestions[index];
    if (!suggestion) {
      return;
    }
    onChange(suggestion.label);
    setIsOpen(false);
    router.push(suggestion.href);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!showPanel && canSuggest) {
        setIsOpen(true);
        return;
      }
      setActiveIndex((prev) => Math.min(prev + 1, Math.max(suggestions.length - 1, 0)));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }
    if (event.key === 'Enter' && showPanel && suggestions[activeIndex]) {
      event.preventDefault();
      selectAt(activeIndex);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div className={cn('relative w-full min-w-0', className)}>
      <label
        className={cn(
          'flex w-full min-w-0 flex-col gap-0.5',
          'rounded-[18px] border border-header-border bg-surface-elevated px-3 py-3',
          'lg:rounded-none lg:border-0 lg:bg-transparent lg:px-3 lg:py-2',
        )}
      >
        <span className="text-[10px] font-bold tracking-[0.1em] text-header-muted uppercase lg:hidden">
          {t('searchLabel')}
        </span>
        <span className="relative flex min-w-0 items-center">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-0 size-4 -translate-y-1/2 text-header-muted"
          />
          <input
            type="search"
            name="q"
            role="combobox"
            value={value}
            onChange={(event) => {
              onChange(event.target.value);
              setIsOpen(true);
              setActiveIndex(0);
            }}
            onFocus={() => {
              if (canSuggest) {
                setIsOpen(true);
              }
            }}
            onBlur={() => {
              if (blurCloseTimerRef.current !== null) {
                window.clearTimeout(blurCloseTimerRef.current);
              }
              blurCloseTimerRef.current = window.setTimeout(() => {
                blurCloseTimerRef.current = null;
                setIsOpen(false);
              }, HERO_KEYWORD_BLUR_CLOSE_DELAY_MS);
            }}
            onKeyDown={onKeyDown}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchLabel')}
            aria-expanded={showPanel}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeOptionId}
            autoComplete="off"
            maxLength={100}
            // Chrome iOS injects `__gcruniqueid` before hydrate — false mismatch in `next dev`.
            suppressHydrationWarning
            className={cn(
              'w-full min-w-0 bg-transparent py-0.5 pl-6 text-sm font-semibold text-ink-navy',
              'placeholder:font-medium placeholder:text-ink-muted',
              'outline-none lg:font-medium',
              'focus-visible:outline-none',
            )}
          />
        </span>
      </label>

      {showPanel ? (
        <SuggestionsList
          listboxId={listboxId}
          suggestions={suggestions}
          activeIndex={activeIndex}
          showEmpty={showEmpty}
          emptyLabel={t('suggestionsEmpty')}
          listLabel={t('searchLabel')}
          kindLabel={(kind) => t(`suggestionKinds.${kind}`)}
          onActiveIndexChange={setActiveIndex}
          onSelectIndex={selectAt}
        />
      ) : null}
    </div>
  );
};

type SuggestionsListProps = {
  listboxId: string;
  suggestions: readonly HeroSearchSuggestion[];
  activeIndex: number;
  showEmpty: boolean;
  emptyLabel: string;
  listLabel: string;
  kindLabel: (kind: HeroSearchSuggestion['kind']) => string;
  onActiveIndexChange: (index: number) => void;
  onSelectIndex: (index: number) => void;
};

const SuggestionsList = ({
  listboxId,
  suggestions,
  activeIndex,
  showEmpty,
  emptyLabel,
  listLabel,
  kindLabel,
  onActiveIndexChange,
  onSelectIndex,
}: SuggestionsListProps) => (
  <ul
    id={listboxId}
    role="listbox"
    aria-label={listLabel}
    className={cn(
      'absolute top-full left-0 z-30 mt-1 max-h-56 overflow-y-auto',
      'w-[min(100%,calc(100vw-2rem))] min-w-full',
      'sm:w-[min(24rem,calc(100vw-2rem))] lg:w-[26rem]',
      HERO_FILTER_PANEL_CLASS,
    )}
  >
    {showEmpty ? (
      <li className="px-4 py-3 text-sm text-header-muted">{emptyLabel}</li>
    ) : (
      suggestions.map((suggestion, index) => {
        const isActive = index === activeIndex;
        return (
          <li
            key={suggestion.id}
            id={`${listboxId}-option-${suggestion.id}`}
            role="option"
            aria-selected={isActive}
          >
            <button
              type="button"
              tabIndex={-1}
              className={cn(
                'flex w-full flex-col gap-0.5 px-4 py-3 text-left',
                heroFilterOptionStateClass(isActive),
              )}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => onActiveIndexChange(index)}
              onClick={() => onSelectIndex(index)}
            >
              <span className="flex items-start justify-between gap-4">
                <span className="min-w-0 flex-1 text-pretty break-words">
                  {suggestion.label}
                </span>
                <span className="shrink-0 pt-0.5 text-[10px] font-bold tracking-wider text-header-muted uppercase">
                  {kindLabel(suggestion.kind)}
                </span>
              </span>
              {suggestion.meta ? (
                <span className="text-pretty break-words text-xs font-normal text-header-muted">
                  {suggestion.meta}
                </span>
              ) : null}
            </button>
          </li>
        );
      })
    )}
  </ul>
);
