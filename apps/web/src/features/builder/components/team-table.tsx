'use client';

import type { CompanyMemberResponse, CompanyMemberStatus } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { BuilderTeamMemberCard } from '@/features/builder/components/builder-team-member-card';
import { COMPANY_MEMBER_ROLES } from '@/features/builder/constants';
import { useUpdateMemberMutation } from '@/features/builder/hooks/use-company-members';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { AdminDeleteModal } from '@/shared/ui/admin-delete-modal';
import { ListTableReveal } from '@/shared/ui/motion';
import { Select } from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import { useSuccessToast } from '@/shared/ui/use-success-toast';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

type TeamTableProps = {
  members: CompanyMemberResponse[];
  canManage: boolean;
  viewMode?: ViewMode | undefined;
};

type PendingAction =
  | {
      type: 'status';
      member: CompanyMemberResponse;
      nextStatus: Extract<CompanyMemberStatus, 'active' | 'inactive'>;
    }
  | {
      type: 'role';
      member: CompanyMemberResponse;
      nextRole: CompanyMemberResponse['role'];
    };

/**
 * Company members as cards (projects-matching) or table with role/deactivate actions.
 */
export const TeamTable = ({ members, canManage, viewMode = VIEW_MODE_CARDS }: TeamTableProps) => {
  const t = useTranslations('Builder.team');
  const updateMutation = useUpdateMemberMutation();
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, successToast } = useSuccessToast();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const requestRoleChange = (
    member: CompanyMemberResponse,
    role: CompanyMemberResponse['role'],
  ): void => {
    if (role === member.role) {
      return;
    }
    setPendingAction({ type: 'role', member, nextRole: role });
  };

  const requestStatusChange = (
    member: CompanyMemberResponse,
    nextStatus: Extract<CompanyMemberStatus, 'active' | 'inactive'>,
  ): void => {
    if (member.status === nextStatus) {
      return;
    }
    setPendingAction({ type: 'status', member, nextStatus });
  };

  const confirmPendingAction = async (): Promise<void> => {
    if (!pendingAction) {
      return;
    }
    setError(null);
    try {
      if (pendingAction.type === 'role') {
        await updateMutation.mutateAsync({
          id: pendingAction.member.id,
          body: { role: pendingAction.nextRole },
        });
      } else {
        await updateMutation.mutateAsync({
          id: pendingAction.member.id,
          body: { status: pendingAction.nextStatus },
        });
      }
      setPendingAction(null);
      showSuccess(t('updateSuccess'));
    } catch {
      setError(t('errors.generic'));
    }
  };

  const isRolePending = pendingAction?.type === 'role';
  const isActivating = pendingAction?.type === 'status' && pendingAction.nextStatus === 'active';
  const pendingName = pendingAction?.member.user.name ?? '';
  const pendingRoleLabel =
    pendingAction?.type === 'role' ? t(`roles.${pendingAction.nextRole}`) : '';

  const confirmTitle = isRolePending
    ? t('roleConfirmTitle')
    : t(isActivating ? 'activateConfirmTitle' : 'deactivateConfirmTitle');
  const confirmMessage = isRolePending
    ? t('roleConfirmMessage', { name: pendingName, role: pendingRoleLabel })
    : t(isActivating ? 'activateConfirmMessage' : 'deactivateConfirmMessage', {
        name: pendingName,
      });
  const confirmLabel = isRolePending
    ? t('roleConfirmAction')
    : t(isActivating ? 'activate' : 'deactivate');

  return (
    <div className="flex flex-col gap-3">
      {viewMode === VIEW_MODE_CARDS ? (
        <AdminListCardGrid className="gap-4">
          {members.map((member) => (
            <BuilderTeamMemberCard
              key={member.id}
              member={member}
              canManage={canManage}
              isPending={updateMutation.isPending}
              onRoleChange={requestRoleChange}
              onActiveChange={(nextMember, active) => {
                requestStatusChange(nextMember, active ? 'active' : 'inactive');
              }}
            />
          ))}
        </AdminListCardGrid>
      ) : (
        <ListTableReveal>
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="w-full min-w-[40rem] border-collapse text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-3 py-2.5 text-left font-medium">{t('columns.name')}</th>
                <th className="px-3 py-2.5 text-left font-medium">{t('columns.email')}</th>
                <th className="px-3 py-2.5 text-center font-medium">{t('columns.role')}</th>
                <th className="px-3 py-2.5 text-center font-medium">{t('columns.status')}</th>
                {canManage ? (
                  <th className="px-3 py-2.5 text-center font-medium">{t('columns.actions')}</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-t border-border hover:bg-surface/60">
                  <td className="px-3 py-2.5 align-middle font-medium text-ink">
                    {member.user.name}
                  </td>
                  <td className="px-3 py-2.5 align-middle text-ink-secondary">
                    {member.user.email}
                  </td>
                  <td className="px-3 py-2.5 align-middle">
                    <div className="flex justify-center">
                      {canManage ? (
                        <Select
                          size="fit"
                          className="h-9 px-3 text-sm"
                          value={member.role}
                          disabled={updateMutation.isPending}
                          aria-label={t('columns.role')}
                          onChange={(event) => {
                            requestRoleChange(
                              member,
                              event.target.value as CompanyMemberResponse['role'],
                            );
                          }}
                        >
                          {COMPANY_MEMBER_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {t(`roles.${role}`)}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <span className="text-ink-secondary">{t(`roles.${member.role}`)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 align-middle text-center text-ink-secondary">
                    {t(`statuses.${member.status}`)}
                  </td>
                  {canManage ? (
                    <td className="px-3 py-2.5 align-middle">
                      <div className="flex justify-center">
                        {member.status !== 'removed' ? (
                          <Switch
                            size="md"
                            checked={member.status === 'active'}
                            disabled={updateMutation.isPending}
                            aria-label={t('activeToggle')}
                            onCheckedChange={(active) => {
                              requestStatusChange(member, active ? 'active' : 'inactive');
                            }}
                          />
                        ) : (
                          <span className="text-ink-muted">—</span>
                        )}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </ListTableReveal>
      )}
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      {successToast}

      <AdminDeleteModal
        open={pendingAction != null}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel={confirmLabel}
        confirming={updateMutation.isPending}
        onCancel={() => {
          if (!updateMutation.isPending) {
            setPendingAction(null);
          }
        }}
        onConfirm={() => {
          void confirmPendingAction();
        }}
      />
    </div>
  );
};
