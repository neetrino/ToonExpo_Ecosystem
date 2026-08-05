'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { CatalogScope } from '@/features/builder/catalog-scope';
import { usePortalProjectQrQuery } from '@/features/builder/hooks/use-portal-projects';
import { QR_DISPLAY_SIZE_PX } from '@/features/buyer/constants';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/cn';

/** How long the “copied” affordance stays visible after a successful clipboard write. */
const QR_COPIED_FEEDBACK_MS = 2000;

type ProjectQrPanelProps = {
  projectId: string;
  projectName: string;
  /** When false, skips the QR fetch (e.g. closed dialog). */
  enabled?: boolean | undefined;
  /** Override catalog scope (admin list cards are outside CatalogScopeProvider). */
  scope?: CatalogScope | undefined;
  /** Centered exhibition layout (modal) vs compact section layout. */
  layout?: 'section' | 'modal' | undefined;
};

/**
 * Exhibition project QR code + copy-link actions.
 */
export const ProjectQrPanel = ({
  projectId,
  projectName,
  enabled = true,
  scope,
  layout = 'section',
}: ProjectQrPanelProps) => {
  const t = useTranslations('Builder.projects.qr');
  const qrQuery = usePortalProjectQrQuery(projectId, { enabled, scope });
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef<number | null>(null);
  const isModal = layout === 'modal';

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current !== null) {
        window.clearTimeout(copiedTimerRef.current);
      }
    };
  }, []);

  const onCopy = useCallback(async (payloadUrl: string) => {
    try {
      await navigator.clipboard.writeText(payloadUrl);
      setCopied(true);
      if (copiedTimerRef.current !== null) {
        window.clearTimeout(copiedTimerRef.current);
      }
      copiedTimerRef.current = window.setTimeout(() => {
        copiedTimerRef.current = null;
        setCopied(false);
      }, QR_COPIED_FEEDBACK_MS);
    } catch {
      setCopied(false);
    }
  }, []);

  if (qrQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (qrQuery.isError || !qrQuery.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        isModal ? 'items-center animate-project-qr-in' : 'items-center sm:flex-row sm:items-start',
      )}
    >
      <div
        className={cn(
          'w-full rounded-md border border-border bg-white shadow-xs',
          isModal ? 'max-w-[min(100%,17.5rem)] p-4 sm:p-5' : 'max-w-[17.5rem] p-5',
        )}
      >
        <div className="aspect-square w-full [&_svg]:h-auto [&_svg]:w-full">
          <QRCodeSVG
            value={qrQuery.data.payloadUrl}
            size={QR_DISPLAY_SIZE_PX}
            level="M"
            marginSize={2}
            title={t('codeTitle', { name: projectName })}
          />
        </div>
      </div>
      <div
        className={cn(
          'flex min-w-0 flex-col gap-3',
          isModal ? 'w-full items-center text-center' : 'flex-1',
        )}
      >
        {isModal ? (
          <p className="font-brand text-lg font-bold tracking-tight text-ink sm:text-xl">
            {projectName}
          </p>
        ) : null}
        <p
          className={cn(
            'break-all text-xs text-ink-secondary',
            isModal && 'max-w-sm px-1 text-center',
          )}
        >
          {qrQuery.data.payloadUrl}
        </p>
        <Button
          type="button"
          size={isModal ? 'md' : 'sm'}
          variant={isModal ? 'primary' : 'secondary'}
          className={isModal ? 'w-full max-w-xs' : 'self-start'}
          onClick={() => {
            void onCopy(qrQuery.data.payloadUrl);
          }}
        >
          {copied ? t('copied') : t('copyLink')}
        </Button>
      </div>
    </div>
  );
};
