'use server';

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import type { QrScanDealMutationResult } from '@/lib/qr/mutation-result';
import { regenerateBuyerQr } from '@/lib/qr/mutations';
import { createDealFromQrScan } from '@/lib/qr/scan-deal-mutations';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

import type { BuilderScanFormState } from './scan-form-state';
import type { RegenerateQrFormState } from './regenerate-form-state';

function getFormString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === 'string' ? value : undefined;
}

function getOptionalFormString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toScanFormState(result: QrScanDealMutationResult): BuilderScanFormState {
  if (result.ok) {
    return result.deduped ? { success: true, deduped: true } : { success: true };
  }
  return { errorKey: result.errorKey };
}

export async function createScanDealAction(
  _locale: string,
  _prevState: BuilderScanFormState,
  formData: FormData,
): Promise<BuilderScanFormState> {
  const builder = await assertBuilderSession();
  if (!builder) {
    return { errorKey: 'unauthorized' };
  }

  const result = await createDealFromQrScan({
    qrToken: getFormString(formData, 'qrToken') ?? '',
    projectId: getOptionalFormString(formData, 'projectId'),
    note: getOptionalFormString(formData, 'note'),
    builderUserId: builder.session.user.id,
    companyId: builder.companyId,
  });

  return toScanFormState(result);
}

export async function regenerateBuyerQrAction(
  locale: string,
  _prevState: RegenerateQrFormState,
  _formData: FormData,
): Promise<RegenerateQrFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { errorKey: 'unauthorized' };
  }

  const result = await regenerateBuyerQr(session.user.id);
  if (!result.ok) {
    return { errorKey: result.errorKey };
  }

  revalidatePath(`/${locale}/account`);
  return { success: true };
}
