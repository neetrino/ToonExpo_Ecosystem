'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ScannerCamera } from '@/features/builder/components/scanner-camera';
import { resolveScannedHref } from '@/features/buyer/utils/resolve-scanned-href';
import { useRouter } from '@/i18n/navigation';

type BuyerScannerWorkspaceProps = {
  onNavigated: () => void;
};

/**
 * Buyer camera scanner — opens project / QR deep links from exhibition codes.
 */
export const BuyerScannerWorkspace = ({ onNavigated }: BuyerScannerWorkspaceProps) => {
  const t = useTranslations('Profile.qr.scanner');
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);

  const handleToken = (raw: string) => {
    if (paused) {
      return;
    }

    const href = resolveScannedHref(raw);
    if (!href) {
      setError(t('errors.invalid'));
      return;
    }

    setPaused(true);
    setError(null);
    onNavigated();
    router.push(href);
  };

  return (
    <div className="flex flex-col gap-4">
      <ScannerCamera paused={paused} onToken={handleToken} showManualHint={false} />
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
};
