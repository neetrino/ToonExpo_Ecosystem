'use client';

import type { CompanyMemberResponse, CompanyMemberStatus } from '@toonexpo/contracts';
import { CheckCircle2, CircleDashed, Mail, Shield, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { COMPANY_MEMBER_ROLES } from '@/features/builder/constants';
import { cn } from '@/shared/ui/cn';
import { Select } from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';

type BuilderTeamMemberCardProps = {
  member: CompanyMemberResponse;
  canManage: boolean;
  isPending: boolean;
  onRoleChange: (member: CompanyMemberResponse, role: CompanyMemberResponse['role']) => void;
  onActiveChange: (member: CompanyMemberResponse, active: boolean) => void;
};

const STATUS_BADGE_CLASS: Record<CompanyMemberStatus, string> = {
  active: 'bg-success-soft text-success',
  inactive: 'bg-surface text-ink-muted',
  removed: 'bg-warning-soft text-warning',
};

/**
 * Team member card — same layout family as builder project cards.
 */
export const BuilderTeamMemberCard = ({
  member,
  canManage,
  isPending,
  onRoleChange,
  onActiveChange,
}: BuilderTeamMemberCardProps) => {
  const t = useTranslations('Builder.team');
  const StatusIcon = member.status === 'active' ? CheckCircle2 : CircleDashed;
  const RoleIcon = member.role === 'company_admin' ? Shield : UserRound;

  return (
    <article
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-lg bg-surface-elevated shadow-xs',
        'transition-[box-shadow,transform] duration-[var(--duration-fast)]',
        'hover:shadow-sm',
      )}
    >
      <div className="flex flex-1 gap-2 p-4">
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="text-base font-semibold tracking-tight text-ink">{member.user.name}</h2>
          <div className="mt-2 flex flex-col gap-1 text-sm text-ink-secondary">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Mail className="size-3.5 shrink-0 opacity-70" aria-hidden />
              <span className="truncate">{member.user.email}</span>
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium',
              STATUS_BADGE_CLASS[member.status],
            )}
          >
            <StatusIcon className="size-3.5" aria-hidden />
            {t(`statuses.${member.status}`)}
          </span>
          {canManage && member.status !== 'removed' ? (
            <Switch
              checked={member.status === 'active'}
              disabled={isPending}
              aria-label={t('activeToggle')}
              onCheckedChange={(active) => {
                onActiveChange(member, active);
              }}
            />
          ) : null}
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-brand-soft text-brand"
            aria-hidden
          >
            <RoleIcon className="size-4" strokeWidth={2} />
          </span>
          {canManage ? (
            <Select
              size="fit"
              className="h-9 px-3 text-sm"
              value={member.role}
              disabled={isPending}
              aria-label={t('columns.role')}
              onChange={(event) => {
                onRoleChange(member, event.target.value as CompanyMemberResponse['role']);
              }}
            >
              {COMPANY_MEMBER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {t(`roles.${role}`)}
                </option>
              ))}
            </Select>
          ) : (
            <span className="text-sm text-ink-secondary">{t(`roles.${member.role}`)}</span>
          )}
        </div>
      </div>
    </article>
  );
};
