'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

import { QR_DISPLAY_SIZE_PX, QR_FULLSCREEN_SIZE_PX } from '@/features/buyer/constants';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/cn';

type BuyerQrCodeProps = {
  payloadUrl: string;
  buyerName: string;
};

/**
 * Large centered buyer QR with optional fullscreen exhibition mode.
 */
export const BuyerQrCode = ({ payloadUrl, buyerName }: BuyerQrCodeProps) => {
  const t = useTranslations('Profile.qr');
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    try {
      if (!document.fullscreenElement) {
        await node.requestFullscreen();
        setIsFullscreen(true);
        return;
      }
      await document.exitFullscreen();
      setIsFullscreen(false);
    } catch {
      setIsFullscreen((prev) => !prev);
    }
  }, []);

  const size = isFullscreen ? QR_FULLSCREEN_SIZE_PX : QR_DISPLAY_SIZE_PX;

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex flex-col items-center gap-5 rounded-md border border-border/60 bg-surface p-6 sm:p-8',
        isFullscreen && 'fixed inset-0 z-50 justify-center border-0 bg-background px-6 py-10',
      )}
    >
      <div className="rounded-md border border-border bg-white p-5 shadow-md">
        <QRCodeSVG
          value={payloadUrl}
          size={size}
          level="M"
          marginSize={2}
          title={t('codeTitle', { name: buyerName })}
        />
      </div>
      <p className="text-center font-brand text-xl font-bold tracking-tight text-ink">
        {buyerName}
      </p>
      <p className="max-w-xs text-center text-sm leading-relaxed text-ink-secondary">{t('hint')}</p>
      <Button
        type="button"
        variant="ghost"
        className="w-full max-w-xs"
        onClick={() => {
          void toggleFullscreen();
        }}
      >
        {isFullscreen ? t('exitFullscreen') : t('fullscreen')}
      </Button>
    </div>
  );
};
