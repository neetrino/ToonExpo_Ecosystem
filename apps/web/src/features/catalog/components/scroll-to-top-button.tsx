'use client';

import { ArrowUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { cn } from '@/shared/ui/cn';

/** Hide until the page has moved past the first screenful. */
const SCROLL_TOP_VISIBLE_AFTER_PX = 280;
const SCROLL_TOP_FADE_MS = 280;

type ScrollToTopButtonProps = {
  className?: string;
};

/**
 * White circular control above the mobile bottom nav (profile slot).
 */
export const ScrollToTopButton = ({ className }: ScrollToTopButtonProps) => {
  const t = useTranslations('Nav');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = (): void => {
      setVisible(window.scrollY > SCROLL_TOP_VISIBLE_AFTER_PX);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      aria-label={t('scrollToTop')}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      className={cn(
        'inline-flex size-11 items-center justify-center rounded-full bg-white text-brand-secondary',
        'shadow-[0_6px_16px_rgb(25_38_67/0.18)]',
        'transition-[opacity,transform] ease-[cubic-bezier(0.22,1,0.36,1)]',
        'motion-reduce:transition-none',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
        className,
      )}
      style={{ transitionDuration: `${SCROLL_TOP_FADE_MS}ms` }}
    >
      <ArrowUp className="size-5" strokeWidth={2} aria-hidden />
    </button>
  );
};
