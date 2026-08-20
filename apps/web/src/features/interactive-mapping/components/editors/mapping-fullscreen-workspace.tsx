'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

type MappingFullscreenWorkspaceProps = {
  open: boolean;
  portalReady: boolean;
  sidebar: ReactNode;
  canvas: ReactNode;
};

/**
 * Full-viewport mapping workspace above admin chrome (portal to document.body).
 */
export const MappingFullscreenWorkspace = ({
  open,
  portalReady,
  sidebar,
  canvas,
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
      <div className="grid min-h-0 flex-1 gap-4 overflow-hidden p-4 lg:grid-cols-[260px_1fr]">
        <div className="min-h-0 overflow-y-auto">{sidebar}</div>
        <div className="min-h-0 min-w-0">{canvas}</div>
      </div>
    </div>,
    document.body,
  );
};
