import { provisionAccountSchema } from '@toonexpo/contracts';
import type { ProvisionActionState } from '@/lib/admin/action-state';
import { assertAdminSession } from '@/lib/admin/assert-admin-session';
import { provisionAccount } from '@/lib/admin/provision';

function parseCompanyName(raw: FormDataEntryValue | null): string | undefined {
  if (typeof raw !== 'string') {
    return undefined;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function provisionAccountAction(
  locale: string,
  _prevState: ProvisionActionState,
  formData: FormData,
): Promise<ProvisionActionState> {
  const session = await assertAdminSession();
  if (!session) {
    return { errorKey: 'unauthorized' };
  }

  const partnerIdRaw = formData.get('partnerId');
  const partnerId =
    typeof partnerIdRaw === 'string' && partnerIdRaw.trim().length > 0
      ? partnerIdRaw.trim()
      : undefined;

  const parsed = provisionAccountSchema.safeParse({
    email: formData.get('email'),
    name: formData.get('name'),
    role: formData.get('role'),
    companyName: parseCompanyName(formData.get('companyName')),
    partnerId,
  });

  if (!parsed.success) {
    return { errorKey: 'invalidInput' };
  }

  const result = await provisionAccount(parsed.data, {
    userId: session.user.id,
    role: session.user.role,
  });
  if (!result.ok) {
    return { errorKey: result.error };
  }
  return {
    successKey: result.emailSent ? 'provisioned' : 'provisionedEmailFailed',
    inviteUrl: result.inviteUrl,
  };
}
