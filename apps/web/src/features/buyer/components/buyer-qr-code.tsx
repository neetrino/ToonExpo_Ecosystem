'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Maximize2, Minimize2, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

import { QR_DISPLAY_SIZE_PX, QR_FULLSCREEN_SIZE_PX } from '@/features/buyer/constants';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { cn } from '@/shared/ui/cn';
import { Reveal } from '@/shared/ui/motion/reveal';

type BuyerQrCodeProps = {
  payloadUrl: string;
  buyerName: string;
};

/**
 * Large centered buyer QR with optional fullscreen exhibition mode.
 * The QR itself is never animated or overlaid.
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
    <Reveal>
      <div
        ref={containerRef}
        className={cn(
          isFullscreen &&
            'fixed inset-0 z-50 flex items-center justify-center bg-background px-6 py-10',
        )}
      >
        <Card
          variant="elevated"
          padding="lg"
          className={cn(
            'mx-auto flex w-full max-w-md flex-col items-center gap-5',
            isFullscreen && 'max-w-lg border-0 shadow-none',
          )}
        >
          <div className="flex items-center gap-2 rounded-pill bg-success-soft px-3 py-1.5 text-xs font-semibold text-success">
            <ShieldCheck className="size-3.5" aria-hidden />
            {t('secureBadge')}
          </div>

          <div className="rounded-md border border-border bg-white p-5 shadow-xs">
            <QRCodeSVG
              value={payloadUrl}
              size={size}
              level="M"
              marginSize={2}
              title={t('codeTitle', { name: buyerName })}
            />
          </div>

          <div className="flex flex-col items-center gap-1 text-center">
            <p className="font-brand text-xl font-bold tracking-tight text-ink">{buyerName}</p>
            <p className="max-w-xs text-sm leading-relaxed text-ink-secondary">{t('hint')}</p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full max-w-xs"
            onClick={() => {
              void toggleFullscreen();
            }}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="size-4" aria-hidden />
                {t('exitFullscreen')}
              </>
            ) : (
              <>
                <Maximize2 className="size-4" aria-hidden />
                {t('fullscreen')}
              </>
            )}
          </Button>
        </Card>
      </div>
    </Reveal>
  );
};
