'use client';

import { Scanner, type IScannerError } from '@yudiel/react-qr-scanner';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { requestCameraAccess } from '@/features/builder/utils/request-camera-access';
import { Button } from '@/shared/ui/button';

type ScannerCameraProps = {
  onToken: (raw: string) => void;
  paused: boolean;
  /** Builder manual-token hint; hide on buyer / check-in. */
  showManualHint?: boolean;
};

type CameraPhase = 'idle' | 'active' | 'blocked' | 'unavailable';

/**
 * Camera QR scanner. Camera starts only after an explicit user tap so the
 * browser can show the permission prompt (auto-start on mount often cannot).
 */
export const ScannerCamera = ({ onToken, paused, showManualHint = true }: ScannerCameraProps) => {
  const t = useTranslations('Builder.scanner');
  const [phase, setPhase] = useState<CameraPhase>('idle');
  const [cameraRetryKey, setCameraRetryKey] = useState(0);

  const handleEnableCamera = async () => {
    // Must be the first await from the click — keeps user activation for the prompt.
    const result = await requestCameraAccess();
    if (result.status === 'granted') {
      setPhase('active');
      setCameraRetryKey((key) => key + 1);
      return;
    }
    setPhase(result.status === 'denied' ? 'blocked' : 'unavailable');
  };

  if (phase !== 'active') {
    const titleKey =
      phase === 'blocked'
        ? 'cameraDenied'
        : phase === 'unavailable'
          ? 'cameraUnavailable'
          : 'cameraPrompt';
    const hintKey =
      phase === 'blocked'
        ? 'cameraSettingsHint'
        : phase === 'unavailable'
          ? 'cameraUnavailableHint'
          : 'cameraPromptHint';

    return (
      <div className="rounded-sm border border-border bg-surface px-4 py-6 text-center">
        <p className="text-sm text-ink">{t(titleKey)}</p>
        <p className="mt-2 text-sm text-ink-secondary">{t(hintKey)}</p>
        {showManualHint && phase !== 'idle' ? (
          <p className="mt-2 text-sm text-ink-secondary">{t('useManual')}</p>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={() => {
            void handleEnableCamera();
          }}
        >
          {phase === 'idle' ? t('retryCamera') : t('retryCameraAgain')}
        </Button>
      </div>
    );
  }

  return (
    // pointer-events-none: camera must not steal sheet swipe-to-dismiss touches
    <div className="pointer-events-none touch-none overflow-hidden rounded-sm border border-border">
      <Scanner
        key={cameraRetryKey}
        formats={['qr_code']}
        paused={paused}
        sound={false}
        constraints={{ facingMode: 'environment' }}
        onScan={(results) => {
          const value = results[0]?.rawValue;
          if (value) {
            onToken(value);
          }
        }}
        onError={(error: IScannerError) => {
          if (error.kind === 'permission-denied') {
            setPhase('blocked');
            return;
          }
          setPhase('unavailable');
        }}
        styles={{
          container: { width: '100%' },
        }}
      />
    </div>
  );
};
