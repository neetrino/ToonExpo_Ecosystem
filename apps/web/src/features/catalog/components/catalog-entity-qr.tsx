'use client';

import { QrCode } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { CatalogEntityQrOverlay } from '@/features/catalog/components/catalog-entity-qr-overlay';
import { cn } from '@/shared/ui/cn';
import { IconButton } from '@/shared/ui/icon-button';

type CatalogEntityQrProps = {
  payloadUrl: string;
  /** Accessible title for the QR SVG inside the modal. */
  codeLabel: string;
  entityName: string;
  className?: string | undefined;
};

/**
 * Icon opposite the title — opens entity QR (centered on desktop, bottom sheet on mobile).
 */
export const CatalogEntityQr = ({
  payloadUrl,
  codeLabel,
  entityName,
  className,
}: CatalogEntityQrProps) => {
  const t = useTranslations('Catalog.entityQr');
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        label={t('open')}
        variant="soft"
        size="lg"
        className={cn('shrink-0', className)}
        onClick={() => {
          setOpen(true);
        }}
      >
        <QrCode className="size-5" aria-hidden />
      </IconButton>

      <CatalogEntityQrOverlay
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        payloadUrl={payloadUrl}
        codeLabel={codeLabel}
        entityName={entityName}
      />
    </>
  );
};
