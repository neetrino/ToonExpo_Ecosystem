'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';

import { cn } from '@/shared/ui/cn';

/** Floor so controls stay usable on very short viewports. */
const AUTH_FIT_MIN_SCALE = 0.68;

type AuthFitStageProps = {
  children: ReactNode;
  className?: string;
};

type FitMetrics = {
  scale: number;
  heightPx: number;
};

/**
 * Scales auth form content to fit the available viewport box without scrolling.
 */
export const AuthFitStage = ({ children, className }: AuthFitStageProps) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<FitMetrics>({ scale: 1, heightPx: 0 });

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const stage = stageRef.current;
    if (!frame || !stage) {
      return;
    }

    const measure = (): void => {
      stage.style.setProperty('--auth-fit-scale', '1');
      const naturalHeight = stage.scrollHeight;
      const naturalWidth = stage.scrollWidth;
      if (naturalHeight <= 0 || naturalWidth <= 0) {
        return;
      }

      const nextScale = Math.min(
        1,
        frame.clientHeight / naturalHeight,
        frame.clientWidth / naturalWidth,
      );
      const scale = Math.max(AUTH_FIT_MIN_SCALE, Number.isFinite(nextScale) ? nextScale : 1);
      const heightPx = Math.round(naturalHeight * scale);
      setFit((prev) =>
        Math.abs(prev.scale - scale) < 0.005 && prev.heightPx === heightPx
          ? prev
          : { scale, heightPx },
      );
      stage.style.setProperty('--auth-fit-scale', String(scale));
    };

    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(stage);
    measure();

    return () => {
      observer.disconnect();
    };
  }, []);

  const slotStyle = {
    height: fit.heightPx > 0 ? `${fit.heightPx}px` : undefined,
  } as CSSProperties;

  return (
    <div
      ref={frameRef}
      className={cn(
        'relative flex min-h-0 flex-1 items-center justify-center overflow-hidden',
        className,
      )}
    >
      <div className="relative w-full max-w-[28rem] overflow-hidden" style={slotStyle}>
        <div
          ref={stageRef}
          className="w-full origin-top [transform:scale(var(--auth-fit-scale,1))]"
        >
          {children}
        </div>
      </div>
    </div>
  );
};
