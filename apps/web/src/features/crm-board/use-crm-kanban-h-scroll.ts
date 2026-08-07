'use client';

import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';

const SCROLL_EDGE_PX = 2;
/** Pixels per animation frame while hovering an arrow. */
const HOVER_SCROLL_PX_PER_FRAME = 10;

type KanbanScrollState = {
  canScrollLeft: boolean;
  canScrollRight: boolean;
};

type UseCrmKanbanHScrollResult = KanbanScrollState & {
  scrollByColumn: (direction: -1 | 1) => void;
  startHoverScroll: (direction: -1 | 1) => void;
  stopHoverScroll: () => void;
};

/**
 * Horizontal scroll helpers for the CRM Kanban column strip (BOS-style arrows).
 */
export const useCrmKanbanHScroll = (
  scrollerRef: RefObject<HTMLElement | null>,
): UseCrmKanbanHScrollResult => {
  const [state, setState] = useState<KanbanScrollState>({
    canScrollLeft: false,
    canScrollRight: false,
  });
  const hoverRafRef = useRef<number | null>(null);
  const hoverDirectionRef = useRef<-1 | 1 | 0>(0);

  const sync = useCallback((): void => {
    const el = scrollerRef.current;
    if (!el) {
      setState({ canScrollLeft: false, canScrollRight: false });
      return;
    }
    const maxScroll = el.scrollWidth - el.clientWidth;
    setState({
      canScrollLeft: el.scrollLeft > SCROLL_EDGE_PX,
      canScrollRight: el.scrollLeft < maxScroll - SCROLL_EDGE_PX,
    });
  }, [scrollerRef]);

  const stopHoverScroll = useCallback((): void => {
    hoverDirectionRef.current = 0;
    if (hoverRafRef.current !== null) {
      window.cancelAnimationFrame(hoverRafRef.current);
      hoverRafRef.current = null;
    }
  }, []);

  const startHoverScroll = useCallback(
    (direction: -1 | 1): void => {
      hoverDirectionRef.current = direction;
      if (hoverRafRef.current !== null) {
        return;
      }

      const tick = (): void => {
        const el = scrollerRef.current;
        const dir = hoverDirectionRef.current;
        if (!el || dir === 0) {
          hoverRafRef.current = null;
          return;
        }

        const maxScroll = el.scrollWidth - el.clientWidth;
        const next = Math.min(
          maxScroll,
          Math.max(0, el.scrollLeft + dir * HOVER_SCROLL_PX_PER_FRAME),
        );
        el.scrollLeft = next;

        const atStart = next <= SCROLL_EDGE_PX;
        const atEnd = next >= maxScroll - SCROLL_EDGE_PX;
        if ((dir < 0 && atStart) || (dir > 0 && atEnd)) {
          stopHoverScroll();
          sync();
          return;
        }

        hoverRafRef.current = window.requestAnimationFrame(tick);
      };

      hoverRafRef.current = window.requestAnimationFrame(tick);
    },
    [scrollerRef, stopHoverScroll, sync],
  );

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) {
      return;
    }

    sync();
    el.addEventListener('scroll', sync, { passive: true });
    const resizeObserver = new ResizeObserver(sync);
    resizeObserver.observe(el);

    return () => {
      stopHoverScroll();
      el.removeEventListener('scroll', sync);
      resizeObserver.disconnect();
    };
  }, [scrollerRef, stopHoverScroll, sync]);

  const scrollByColumn = useCallback(
    (direction: -1 | 1): void => {
      const el = scrollerRef.current;
      if (!el) {
        return;
      }
      const column = el.querySelector<HTMLElement>('.crm-kanban-column');
      const styles = getComputedStyle(el);
      const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
      const step = column ? column.getBoundingClientRect().width + gap : el.clientWidth / 4;
      el.scrollBy({ left: direction * step, behavior: 'smooth' });
    },
    [scrollerRef],
  );

  return { ...state, scrollByColumn, startHoverScroll, stopHoverScroll };
};
