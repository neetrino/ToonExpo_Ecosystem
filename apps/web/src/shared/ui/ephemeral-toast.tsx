'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/shared/ui/cn';

const TOAST_VISIBLE_MS = 3400;
const TOAST_FADE_MS = 420;

type EphemeralToastProps = {
  message: string | null;
  onDismiss: () => void;
  tone?: 'danger' | 'neutral' | undefined;
};

/**
 * Fixed top-center toast — fades and slides in, holds, then fades out.
 */
export const EphemeralToast = ({
  message,
  onDismiss,
  tone = 'danger',
}: EphemeralToastProps) => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }

    setVisible(false);
    let enterFrame2 = 0;
    const enterFrame1 = window.requestAnimationFrame(() => {
      enterFrame2 = window.requestAnimationFrame(() => {
        setVisible(true);
      });
    });
    const hideTimer = window.setTimeout(() => {
      setVisible(false);
    }, TOAST_VISIBLE_MS);
    const dismissTimer = window.setTimeout(() => {
      onDismiss();
    }, TOAST_VISIBLE_MS + TOAST_FADE_MS);

    return () => {
      window.cancelAnimationFrame(enterFrame1);
      window.cancelAnimationFrame(enterFrame2);
      window.clearTimeout(hideTimer);
      window.clearTimeout(dismissTimer);
    };
  }, [message, onDismiss]);

  if (!mounted || !message) {
    return null;
  }

  return createPortal(
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'pointer-events-none fixed inset-x-0 top-8 z-[var(--z-toast)] flex justify-center px-4',
        'transition-[opacity,transform] duration-[420ms] ease-[var(--ease-out-premium)]',
        'motion-reduce:transition-none',
        visible ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0',
      )}
    >
      <p
        className={cn(
          'max-w-lg rounded-md px-6 py-4 text-center text-base font-medium shadow-card',
          'ring-1 ring-border/70',
          tone === 'danger'
            ? 'bg-danger-soft text-danger'
            : 'bg-surface-elevated text-ink',
        )}
      >
        {message}
      </p>
    </div>,
    document.body,
  );
};
