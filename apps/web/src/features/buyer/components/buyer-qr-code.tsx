'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useTranslations } from 'next-intl';

import { QR_DISPLAY_SIZE_PX } from '@/features/buyer/constants';
import { Card } from '@/shared/ui/card';
import { Reveal } from '@/shared/ui/motion/reveal';

type BuyerQrCodeProps = {
  payloadUrl: string;
  buyerName: string;
};

/**
 * Large centered buyer QR for exhibition check-in / builder scans.
 */
export const BuyerQrCode = ({ payloadUrl, buyerName }: BuyerQrCodeProps) => {
  const t = useTranslations('Profile.qr');

  return (
    <Reveal>
      <Card
        variant="elevated"
        padding="lg"
        className="mx-auto flex w-full max-w-md flex-col items-center gap-5"
      >
        <div className="rounded-md border border-border bg-white p-5 shadow-xs">
          <QRCodeSVG
            value={payloadUrl}
            size={QR_DISPLAY_SIZE_PX}
            level="M"
            marginSize={2}
            title={t('codeTitle', { name: buyerName })}
          />
        </div>

        <p className="font-brand text-xl font-bold tracking-tight text-ink">{buyerName}</p>
      </Card>
    </Reveal>
  );
};
