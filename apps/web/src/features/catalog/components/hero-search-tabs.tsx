'use client';

import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';

import { cn } from '@/shared/ui/cn';

export type HeroSearchTab = 'buy' | 'rent' | 'newBuilds';

type HeroSearchTabsProps = {
  activeTab: HeroSearchTab;
  labels: Record<HeroSearchTab, string>;
  listLabel: string;
  onChange: (tab: HeroSearchTab) => void;
};

type TabIndicator = {
  left: number;
  width: number;
};

const TAB_KEYS: readonly HeroSearchTab[] = ['buy', 'rent', 'newBuilds'];
/** Soft slide — longer than base nav so the underline feels continuous. */
const TAB_INDICATOR_DURATION_MS = 480;

/**
 * Buy / Rent / New Builds switcher with a sliding underline.
 */
export const HeroSearchTabs = ({ activeTab, labels, listLabel, onChange }: HeroSearchTabsProps) => {
  const [indicator, setIndicator] = useState<TabIndicator>({ left: 0, width: 0 });
  const [indicatorReady, setIndicatorReady] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const tabListRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef(new Map<HeroSearchTab, HTMLButtonElement>());

  const syncIndicator = useCallback(() => {
    const list = tabListRef.current;
    const active = tabRefs.current.get(activeTab);
    if (!list || !active) {
      return;
    }
    setIndicator({
      left: active.offsetLeft - list.scrollLeft,
      width: active.offsetWidth,
    });
    setIndicatorReady(true);
  }, [activeTab]);

  useLayoutEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => setReduceMotion(motionQuery.matches);
    syncMotion();
    motionQuery.addEventListener('change', syncMotion);
    syncIndicator();

    const list = tabListRef.current;
    if (!list) {
      return () => motionQuery.removeEventListener('change', syncMotion);
    }

    const resizeObserver = new ResizeObserver(() => syncIndicator());
    resizeObserver.observe(list);
    for (const node of tabRefs.current.values()) {
      resizeObserver.observe(node);
    }
    list.addEventListener('scroll', syncIndicator, { passive: true });
    window.addEventListener('resize', syncIndicator);

    return () => {
      motionQuery.removeEventListener('change', syncMotion);
      resizeObserver.disconnect();
      list.removeEventListener('scroll', syncIndicator);
      window.removeEventListener('resize', syncIndicator);
    };
  }, [syncIndicator]);

  const motionMs = !indicatorReady || reduceMotion ? '0ms' : `${TAB_INDICATOR_DURATION_MS}ms`;

  return (
    <div
      ref={tabListRef}
      className={cn(
        'relative flex overflow-x-auto border-b border-header-border',
        '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      )}
      role="tablist"
      aria-label={listLabel}
    >
      {TAB_KEYS.map((key) => {
        const isActive = activeTab === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={isActive}
            ref={(node) => {
              if (node) {
                tabRefs.current.set(key, node);
              } else {
                tabRefs.current.delete(key);
              }
            }}
            onClick={() => onChange(key)}
            className={cn(
              'relative z-10 shrink-0 px-[clamp(0.85rem,0.6rem+0.8vw,1.25rem)] py-3 text-sm font-semibold',
              'transition-colors ease-[var(--ease-out-premium)]',
              isActive ? 'text-brand-deep' : 'text-header-muted hover:text-brand-deep',
            )}
            style={{ transitionDuration: motionMs }}
          >
            {labels[key]}
          </button>
        );
      })}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute bottom-0 left-0 z-20 h-0.5 bg-brand-secondary will-change-[transform,width]',
          indicatorReady &&
            !reduceMotion &&
            'transition-[transform,width] ease-[var(--ease-out-premium)]',
        )}
        style={
          {
            transform: `translate3d(${indicator.left}px, 0, 0)`,
            width: indicator.width,
            transitionDuration: motionMs,
          } satisfies CSSProperties
        }
      />
    </div>
  );
};
