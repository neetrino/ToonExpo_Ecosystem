'use client';

import { Minimize2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/shared/ui/button';

type MappingFullscreenWorkspaceProps = {
  open: boolean;
  portalReady: boolean;
  sidebar: ReactNode;
  canvas: ReactNode;
  onClose: () => void;
};

/**
 * Full-viewport mapping workspace above admin chrome (portal to document.body).
 */
export const MappingFullscreenWorkspace = ({
  open,
  portalReady,
  sidebar,
  canvas,
  onClose,
}: MappingFullscreenWorkspaceProps) => {
  const t = useTranslations('Admin.interactiveMapping.canvas');

  if (!portalReady || !open) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-background"
      role="dialog"
      aria-modal="true"
      aria-label={t('fullscreenAria')}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="text-sm text-ink-muted">{t('fullscreenHint')}</p>
        <Button type="button" size="sm" variant="secondary" onClick={onClose}>
          <Minimize2 className="size-4" aria-hidden />
          {t('exitFullscreen')}
        </Button>
      </header>
      <div className="grid min-h-0 flex-1 gap-4 overflow-hidden p-4 lg:grid-cols-[260px_1fr]">
        <div className="min-h-0 overflow-y-auto">{sidebar}</div>
        <div className="min-h-0 min-w-0">{canvas}</div>
      </div>
    </div>,
    document.body,
  );
};
