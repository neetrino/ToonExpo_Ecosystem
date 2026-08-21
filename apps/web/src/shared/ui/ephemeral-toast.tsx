'use client';

import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/shared/ui/cn';

const TOAST_VISIBLE_MS = 2800;
const TOAST_FADE_MS = 700;

type EphemeralToastProps = {
  message: string | null;
  onDismiss: () => void;
  tone?: 'danger' | 'neutral' | 'success' | undefined;
  /** Changes restart the show/hide cycle (same message text can replay). */
  id?: number | undefined;
  /** How long the toast stays fully visible before fading. */
  holdMs?: number | undefined;
};

/**
 * Fixed top-center toast — fades and slides in, holds, then fades out.
 */
export const EphemeralToast = ({
  message,
  onDismiss,
  tone = 'danger',
  id,
  holdMs = TOAST_VISIBLE_MS,
}: EphemeralToastProps) => {
  const [mounted, setMounted] = useState(false);
  const [displayed, setDisplayed] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      const clearTimer = window.setTimeout(() => {
        setDisplayed(null);
      }, TOAST_FADE_MS);
      return () => {
        window.clearTimeout(clearTimer);
      };
    }

    setDisplayed(message);
    setVisible(false);

    let enterFrame2 = 0;
    const enterFrame1 = window.requestAnimationFrame(() => {
      enterFrame2 = window.requestAnimationFrame(() => {
        setVisible(true);
      });
    });
    const hideTimer = window.setTimeout(() => {
      setVisible(false);
    }, holdMs);
    const dismissTimer = window.setTimeout(() => {
      onDismiss();
    }, holdMs + TOAST_FADE_MS);

    return () => {
      window.cancelAnimationFrame(enterFrame1);
      window.cancelAnimationFrame(enterFrame2);
      window.clearTimeout(hideTimer);
      window.clearTimeout(dismissTimer);
    };
  }, [message, id, onDismiss, holdMs]);

  if (!mounted || !displayed) {
    return null;
  }

  return createPortal(
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      aria-live={tone === 'danger' ? 'assertive' : 'polite'}
      className={cn(
        'pointer-events-none fixed inset-x-0 top-8 z-[var(--z-toast)] flex justify-center px-4',
        visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0',
      )}
      style={{
        transitionProperty: 'opacity, transform',
        transitionDuration: `${TOAST_FADE_MS}ms`,
        transitionTimingFunction: visible
          ? 'var(--ease-out-premium)'
          : 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div
        className={cn(
          'flex max-w-lg items-start gap-3 rounded-md px-5 py-4 text-base font-medium shadow-card',
          'ring-1',
          tone === 'danger'
            ? 'bg-danger text-white ring-danger'
            : tone === 'success'
              ? 'bg-surface-elevated text-success ring-border/70'
              : 'bg-surface-elevated text-ink ring-border/70',
        )}
      >
        {tone === 'danger' ? (
          <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
        ) : null}
        <p className={tone === 'danger' ? 'text-start' : 'text-center'}>{displayed}</p>
      </div>
    </div>,
    document.body,
  );
};
