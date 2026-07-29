'use client';

import type { QrBuyerActionPayload } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ScannerBuyerResult } from '@/features/builder/components/scanner-buyer-result';
import { ScannerCamera } from '@/features/builder/components/scanner-camera';
import { extractQrToken, isNonToonexpoQrPayload } from '@/features/builder/utils/extract-qr-token';
import { resolveQrToken } from '@/features/buyer/api/qr-resolve-api';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';

type ResolveState =
  | { status: 'idle' }
  | { status: 'resolving' }
  | { status: 'buyer'; payload: QrBuyerActionPayload }
  | { status: 'error'; message: string };

/**
 * Builder QR scan workspace (camera + manual token) — page or bottom sheet.
 */
export const ScannerWorkspace = () => {
  const t = useTranslations('Builder.scanner');
  const [manual, setManual] = useState('');
  const [state, setState] = useState<ResolveState>({ status: 'idle' });
  const paused = state.status === 'resolving' || state.status === 'buyer';

  const resolveToken = async (raw: string) => {
    if (isNonToonexpoQrPayload(raw)) {
      setState({ status: 'error', message: t('errors.notToonexpo') });
      return;
    }
    const token = extractQrToken(raw);
    if (!token) {
      setState({ status: 'error', message: t('errors.invalid') });
      return;
    }

    setState({ status: 'resolving' });
    try {
      const data = await resolveQrToken({ token });
      if (data.kind === 'buyer_action') {
        setState({ status: 'buyer', payload: data });
        return;
      }
      setState({ status: 'error', message: t('errors.notBuyer') });
    } catch {
      setState({ status: 'error', message: t('errors.resolve') });
    }
  };

  const reset = () => {
    setState({ status: 'idle' });
    setManual('');
  };

  if (state.status === 'buyer') {
    return <ScannerBuyerResult payload={state.payload} onReset={reset} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <ScannerCamera
        paused={paused}
        onToken={(raw) => {
          void resolveToken(raw);
        }}
      />

      {state.status === 'resolving' ? (
        <p className="text-sm text-ink-secondary">{t('resolving')}</p>
      ) : null}

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-danger">
          {state.message}
        </p>
      ) : null}

      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void resolveToken(manual);
        }}
      >
        <FormField id="manual-token" label={t('manualLabel')}>
          <Input
            id="manual-token"
            value={manual}
            placeholder={t('manualPlaceholder')}
            onChange={(event) => {
              setManual(event.target.value);
            }}
          />
        </FormField>
        <Button type="submit" variant="secondary" className="w-full">
          {t('manualSubmit')}
        </Button>
      </form>
    </div>
  );
};
