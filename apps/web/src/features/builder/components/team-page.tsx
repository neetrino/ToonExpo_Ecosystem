'use client';

import { Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { InviteMemberSheet } from '@/features/builder/components/invite-member-sheet';
import { TeamTable } from '@/features/builder/components/team-table';
import { PORTAL_DEFAULT_PAGE_SIZE, TEAM_VIEW_MODE_KEY } from '@/features/builder/constants';
import { useCompanyMembersQuery } from '@/features/builder/hooks/use-company-members';
import { useIsCompanyAdmin } from '@/features/builder/hooks/use-company-profile';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';
import { Reveal } from '@/shared/ui/motion';
import { PageTitleBlock } from '@/shared/ui/page-title-icon';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

const parsePage = (raw: string | null): number => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
};

/**
 * Team page: list for all members; invite/role actions for company_admin only.
 */
export const TeamPage = () => {
  const t = useTranslations('Builder.team');
  const searchParams = useSearchParams();
  const page = parsePage(searchParams.get('page'));
  const pageSize = PORTAL_DEFAULT_PAGE_SIZE;
  const canManage = useIsCompanyAdmin();
  const membersQuery = useCompanyMembersQuery(page, pageSize);
  const { viewMode, effectiveViewMode, setViewMode } = usePersistedViewMode(TEAM_VIEW_MODE_KEY);
  const [inviteEmail, setInviteEmail] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  if (membersQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (membersQuery.isError || !membersQuery.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  const response = membersQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <Reveal force>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PageTitleBlock
            title={t('title')}
            subtitle={t('subtitle', { count: response.meta.total })}
            icon={Users}
          >
            {!canManage ? <p className="text-sm text-ink-muted">{t('readOnlyNotice')}</p> : null}
          </PageTitleBlock>
          <div className="flex flex-wrap items-center gap-2">
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
            {canManage ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="shrink-0"
                onClick={() => {
                  setInviteOpen(true);
                  setInviteEmail(null);
                }}
              >
                <AddActionLabel>{t('inviteMember')}</AddActionLabel>
              </Button>
            ) : null}
          </div>
        </div>
      </Reveal>

      {inviteEmail ? (
        <p role="status" className="rounded-sm bg-surface px-3 py-2 text-sm text-ink">
          {t('inviteSuccess', { email: inviteEmail })}
        </p>
      ) : null}

      {response.data.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t('empty')}</p>
      ) : (
        <TeamTable members={response.data} canManage={canManage} viewMode={effectiveViewMode} />
      )}

      <CatalogPagination
        page={response.meta.page}
        totalPages={response.meta.totalPages}
        buildHref={(nextPage) =>
          nextPage <= 1 ? '/builder/team' : `/builder/team?page=${nextPage}`
        }
        previousLabel={t('pagination.previous')}
        nextLabel={t('pagination.next')}
        ariaLabel={t('pagination.ariaLabel')}
      />

      {canManage ? (
        <InviteMemberSheet
          open={inviteOpen}
          onClose={() => {
            setInviteOpen(false);
          }}
          onSuccess={(email) => {
            setInviteEmail(email);
          }}
        />
      ) : null}
    </div>
  );
};
