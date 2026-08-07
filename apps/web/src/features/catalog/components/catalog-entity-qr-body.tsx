'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

import { CATALOG_ENTITY_QR_SIZE_PX } from '@/features/catalog/constants';
import { Button } from '@/shared/ui/button';

/** How long the “copied” affordance stays visible after a successful clipboard write. */
const QR_COPIED_FEEDBACK_MS = 2000;

type CatalogEntityQrBodyProps = {
  payloadUrl: string;
  codeLabel: string;
  entityName: string;
  actionsDisabled: boolean;
};

export const CatalogEntityQrBody = ({
  payloadUrl,
  codeLabel,
  entityName,
  actionsDisabled,
}: CatalogEntityQrBodyProps) => {
  const t = useTranslations('Catalog.entityQr');
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current !== null) {
        window.clearTimeout(copiedTimerRef.current);
      }
    };
  }, []);

  const onCopy = useCallback(async () => {
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
  }, [payloadUrl]);

  return (
    <div className="mx-auto flex w-full max-w-[min(100%,17.5rem)] flex-col items-center gap-4">
      <div className="w-full rounded-md border border-border bg-white p-4 shadow-xs sm:p-5">
        <div className="aspect-square w-full [&_svg]:h-auto [&_svg]:w-full">
          <QRCodeSVG
            value={payloadUrl}
            size={CATALOG_ENTITY_QR_SIZE_PX}
            level="M"
            marginSize={2}
            title={codeLabel}
          />
        </div>
      </div>
      <p className="text-center font-brand text-lg font-bold tracking-tight text-ink">
        {entityName}
      </p>
      <Button
        type="button"
        size="md"
        variant="primary"
        className="w-full"
        disabled={actionsDisabled}
        onClick={() => {
          void onCopy();
        }}
      >
        {copied ? t('copied') : t('copyLink')}
      </Button>
    </div>
  );
};
