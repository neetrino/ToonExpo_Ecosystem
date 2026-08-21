'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { AddBuildingForm } from '@/features/builder/components/add-building-form';
import { PORTAL_MAX_PAGE_SIZE } from '@/features/builder/constants';
import { usePortalProjectsQuery } from '@/features/builder/hooks/use-portal-projects';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { FormField } from '@/shared/ui/form-field';
import { ListboxSelect } from '@/shared/ui/listbox-select';

type PortalCreateBuildingSheetProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Builder sheet: pick a project, then create a building.
 */
export const PortalCreateBuildingSheet = ({ open, onClose }: PortalCreateBuildingSheetProps) => {
  const t = useTranslations('Admin.buildings.create');
  const projectsQuery = usePortalProjectsQuery(1, PORTAL_MAX_PAGE_SIZE);
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }
    setProjectId('');
  }, [open]);

  const projectOptions = useMemo(
    () =>
      (projectsQuery.data?.data ?? [])
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((project) => ({ value: project.id, label: project.name })),
    [projectsQuery.data],
  );

  return (
    <AdminCreateSheet open={open} onClose={onClose} title={t('title')} size="comfortable">
      <div className="flex flex-col gap-4">
        <FormField id="portal-create-building-project" label={t('project')}>
          <ListboxSelect
            id="portal-create-building-project"
            variant="field"
            searchable
            value={projectId}
            disabled={projectsQuery.isLoading}
            options={projectOptions}
            placeholder={t('searchProject')}
            emptyLabel={t('noProjectMatches')}
            aria-label={t('project')}
            onChange={setProjectId}
          />
        </FormField>
        {projectId ? <AddBuildingForm projectId={projectId} onSuccess={onClose} /> : null}
      </div>
    </AdminCreateSheet>
  );
};
