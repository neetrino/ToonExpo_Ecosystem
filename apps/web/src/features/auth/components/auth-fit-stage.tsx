'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';

import { cn } from '@/shared/ui/cn';

type AuthFitStageProps = {
  children: ReactNode;
  className?: string;
};

type FitMetrics = {
  scale: number;
  heightPx: number;
  ready: boolean;
};

/**
 * Scales auth form content to fit the available viewport box without scrolling.
 */
export const AuthFitStage = ({ children, className }: AuthFitStageProps) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<FitMetrics>({ scale: 1, heightPx: 0, ready: false });

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

      const desktopFit = window.matchMedia('(min-width: 1024px)').matches;
      const nextScale = desktopFit
        ? Math.min(1, frame.clientHeight / naturalHeight, frame.clientWidth / naturalWidth)
        : 1;
      const scale = Number.isFinite(nextScale) ? nextScale : 1;
      const heightPx = Math.round(naturalHeight * scale);
      setFit((prev) =>
        prev.ready && Math.abs(prev.scale - scale) < 0.005 && prev.heightPx === heightPx
          ? prev
          : { scale, heightPx, ready: true },
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
        'relative flex min-h-0 flex-1 items-center justify-center overflow-hidden max-lg:h-auto max-lg:flex-none max-lg:overflow-visible',
        className,
      )}
    >
      <div
        className={cn(
          'relative w-full max-w-[28rem] overflow-hidden',
          fit.ready ? 'opacity-100' : 'opacity-0',
        )}
        style={slotStyle}
      >
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
