'use client';

import { Scanner, type IScannerError } from '@yudiel/react-qr-scanner';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import {
  consumePrimedCameraAccess,
  readCameraPermission,
  requestCameraAccess,
  type CameraAccessResult,
} from '@/features/builder/utils/request-camera-access';
import { Button } from '@/shared/ui/button';

type ScannerCameraProps = {
  onToken: (raw: string) => void;
  paused: boolean;
  /** Builder manual-token hint; hide on buyer / check-in. */
  showManualHint?: boolean;
};

type CameraPhase = 'starting' | 'idle' | 'active' | 'blocked' | 'unavailable';

const applyAccess = (
  result: CameraAccessResult,
  setPhase: (phase: CameraPhase) => void,
  bumpKey: () => void,
): void => {
  if (result.status === 'granted') {
    bumpKey();
    setPhase('active');
    return;
  }
  setPhase(result.status === 'denied' ? 'blocked' : 'unavailable');
};

/**
 * Camera QR scanner. A scan click primes permission; an already-granted
 * camera opens immediately without the extra prompt card.
 */
export const ScannerCamera = ({ onToken, paused, showManualHint = true }: ScannerCameraProps) => {
  const t = useTranslations('Builder.scanner');
  const [phase, setPhase] = useState<CameraPhase>('starting');
  const [cameraRetryKey, setCameraRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const primed = consumePrimedCameraAccess();
    const finish = (result: CameraAccessResult): void => {
      if (cancelled) {
        return;
      }
      applyAccess(result, setPhase, () => {
        setCameraRetryKey((key) => key + 1);
      });
    };

    if (primed) {
      void primed.then(finish);
      return () => {
        cancelled = true;
      };
    }

    void readCameraPermission().then((state) => {
      if (cancelled) {
        return;
      }
      if (state === 'granted') {
        setPhase('active');
        return;
      }
      setPhase('idle');
    });

    return () => {
      cancelled = true;
    };
  }, []);

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

  if (phase === 'starting') {
    return <div className="aspect-square w-full animate-pulse rounded-[20px] bg-band-mist" />;
  }

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
      <div className="rounded-[20px] bg-band-mist px-5 py-6 text-center">
        <p className="text-sm font-medium text-ink-navy">{t(titleKey)}</p>
        <p className="mt-2 text-sm leading-5 text-header-muted">{t(hintKey)}</p>
        {showManualHint && phase !== 'idle' ? (
          <p className="mt-2 text-sm text-header-muted">{t('useManual')}</p>
        ) : null}
        <Button
          type="button"
          className="mt-5 h-12 w-full rounded-full"
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
