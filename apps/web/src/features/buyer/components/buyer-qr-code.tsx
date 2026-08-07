'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

import { QR_DISPLAY_SIZE_PX } from '@/features/buyer/constants';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/cn';

/** How long the “copied” affordance stays visible after a successful clipboard write. */
const QR_COPIED_FEEDBACK_MS = 2000;

type BuyerQrCodeProps = {
  payloadUrl: string;
  buyerName: string;
  /** When true, copy control is non-interactive (e.g. sheet exiting). */
  actionsDisabled?: boolean | undefined;
};

/**
 * Buyer QR — same layout as catalog apartment/project QR (frame + name + copy).
 */
export const BuyerQrCode = ({
  payloadUrl,
  buyerName,
  actionsDisabled = false,
}: BuyerQrCodeProps) => {
  const t = useTranslations('Profile.qr');
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
    <div
      className={cn('mx-auto flex w-full max-w-[min(100%,17.5rem)] flex-col items-center gap-4')}
    >
      <div className="w-full rounded-md border border-border bg-white p-4 shadow-xs sm:p-5">
        <div className="aspect-square w-full [&_svg]:h-auto [&_svg]:w-full">
          <QRCodeSVG
            value={payloadUrl}
            size={QR_DISPLAY_SIZE_PX}
            level="M"
            marginSize={2}
            title={t('codeTitle', { name: buyerName })}
          />
        </div>
      </div>
      <p className="text-center font-brand text-lg font-bold tracking-tight text-ink">
        {buyerName}
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
