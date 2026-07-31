'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useTranslations } from 'next-intl';

import { QR_DISPLAY_SIZE_PX } from '@/features/buyer/constants';
import { Card } from '@/shared/ui/card';
import { cn } from '@/shared/ui/cn';
import { Reveal } from '@/shared/ui/motion/reveal';

type BuyerQrCodeProps = {
  payloadUrl: string;
  buyerName: string;
};

/**
 * Large centered buyer QR for exhibition check-in / builder scans.
 * Slightly smaller on narrow screens via fluid width clamp.
 */
export const BuyerQrCode = ({ payloadUrl, buyerName }: BuyerQrCodeProps) => {
  const t = useTranslations('Profile.qr');

  return (
    <Reveal>
      <Card
        variant="elevated"
        padding="lg"
        className="mx-auto flex w-full max-w-md flex-col items-center gap-4 sm:gap-5"
      >
        <div
          className={cn(
            'w-full rounded-md border border-border bg-white p-3 shadow-xs sm:p-5',
            'max-w-[min(100%,clamp(12.5rem,72vw,17.5rem))]',
          )}
        >
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

        <p className="font-brand text-lg font-bold tracking-tight text-ink sm:text-xl">
          {buyerName}
        </p>
      </Card>
    </Reveal>
  );
};
