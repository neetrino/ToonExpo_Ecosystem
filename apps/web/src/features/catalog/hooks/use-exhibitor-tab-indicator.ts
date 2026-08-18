'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';

import type { ExhibitorTab } from '@/features/catalog/constants/exhibitor-tabs';

export type ExhibitorTabIndicator = {
  left: number;
  width: number;
};

type UseExhibitorTabIndicatorResult = {
  scrollerRef: RefObject<HTMLDivElement | null>;
  setTabRef: (tab: ExhibitorTab) => (node: HTMLLIElement | null) => void;
  indicator: ExhibitorTabIndicator | null;
};

type TabRefMap = Partial<Record<ExhibitorTab, HTMLLIElement>>;

/** Survives App Router remounts so the underline can slide to the next tab. */
let persistedIndicator: ExhibitorTabIndicator | null = null;
let hasAlignedScroller = false;

const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const measureTab = (el: HTMLLIElement): ExhibitorTabIndicator => ({
  left: el.offsetLeft,
  width: el.offsetWidth,
});

const scrollTabIntoView = (
  scroller: HTMLDivElement,
  el: HTMLLIElement,
  behavior: ScrollBehavior,
): void => {
  const left = el.offsetLeft - (scroller.clientWidth - el.offsetWidth) / 2;
  scroller.scrollTo({ left: Math.max(0, left), behavior });
};

const observeScroller = (scroller: HTMLDivElement, onResize: () => void): (() => void) => {
  const observer = new ResizeObserver(onResize);
  observer.observe(scroller);
  return () => observer.disconnect();
};

const alignActiveTab = (
  scroller: HTMLDivElement,
  el: HTMLLIElement,
  measure: () => void,
): void => {
  if (!persistedIndicator) {
    measure();
  }
  const behavior = prefersReducedMotion() || !hasAlignedScroller ? 'auto' : 'smooth';
  hasAlignedScroller = true;
  scrollTabIntoView(scroller, el, behavior);
};

const useExhibitorTabEffects = (
  activeTab: ExhibitorTab,
  scrollerRef: RefObject<HTMLDivElement | null>,
  tabRefs: RefObject<TabRefMap>,
  measureActiveTab: () => void,
): void => {
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const el = tabRefs.current[activeTab];
    if (scroller && el) {
      alignActiveTab(scroller, el, measureActiveTab);
    }
  }, [activeTab, measureActiveTab, scrollerRef, tabRefs]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(measureActiveTab);
    return () => window.cancelAnimationFrame(frame);
  }, [measureActiveTab]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    return scroller ? observeScroller(scroller, measureActiveTab) : undefined;
  }, [measureActiveTab, scrollerRef]);
};

/**
 * Measures the active exhibitor tab and keeps it centered in the scroller.
 */
export const useExhibitorTabIndicator = (
  activeTab: ExhibitorTab,
): UseExhibitorTabIndicatorResult => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<TabRefMap>({});
  const [indicator, setIndicator] = useState<ExhibitorTabIndicator | null>(
    () => persistedIndicator,
  );

  const setTabRef = useCallback(
    (tab: ExhibitorTab) => (node: HTMLLIElement | null) => {
      if (node) {
        tabRefs.current[tab] = node;
        return;
      }
      delete tabRefs.current[tab];
    },
    [],
  );

  const measureActiveTab = useCallback(() => {
    const el = tabRefs.current[activeTab];
    if (!el) {
      return;
    }
    const next = measureTab(el);
    persistedIndicator = next;
    setIndicator(next);
  }, [activeTab]);

  useExhibitorTabEffects(activeTab, scrollerRef, tabRefs, measureActiveTab);

  return { scrollerRef, setTabRef, indicator };
};
