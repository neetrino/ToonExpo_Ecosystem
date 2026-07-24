'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { registerFloorPlanLightbox } from '@/shared/ui/floor-plan-lightbox-stack';
import { IconButton } from '@/shared/ui/icon-button';
import { lockBodyScroll, unlockBodyScroll } from '@/shared/ui/body-scroll-lock';

/** Above nested side sheets (`--z-modal` = 140). */
const FLOOR_PLAN_LIGHTBOX_Z_INDEX = 150;

type FloorPlanLightboxProps = {
  open: boolean;
  imageUrl: string;
  alt: string;
  onClose: () => void;
};

/**
 * Full-viewport floor plan viewer (backdrop click / Escape / close).
 */
export const FloorPlanLightbox = ({ open, imageUrl, alt, onClose }: FloorPlanLightboxProps) => {
  const t = useTranslations('Common');

  useEffect(() => {
    if (!open) {
      return;
    }

    const unregister = registerFloorPlanLightbox();
    lockBodyScroll();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      onClose();
    };
    window.addEventListener('keydown', onKeyDown, true);

    return () => {
      unregister();
      unlockBodyScroll();
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-ink/90 p-4"
      style={{ zIndex: FLOOR_PLAN_LIGHTBOX_Z_INDEX }}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button
        type="button"
        aria-label={t('close')}
        className="absolute inset-0 cursor-zoom-out"
        onClick={onClose}
      />
      <div className="absolute top-4 right-4 z-10">
        <IconButton label={t('close')} variant="soft" onClick={onClose}>
          <X className="size-5 text-on-brand" aria-hidden />
        </IconButton>
      </div>
      <img
        src={imageUrl}
        alt={alt}
        className="relative max-h-[min(100dvh-2rem,100%)] max-w-full object-contain"
        onClick={(event) => {
          event.stopPropagation();
        }}
      />
    </div>,
    document.body,
  );
};
