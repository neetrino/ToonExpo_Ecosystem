'use client';

import { useTranslations } from 'next-intl';

import { catalogProjectDetailHref } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { CreateProjectForm } from '@/features/builder/components/create-project-form';
import { useRouter } from '@/i18n/navigation';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';

type CreateProjectSheetProps = {
  open: boolean;
  onClose: () => void;
  /** When set, replaces the default navigate-to-project-detail flow. */
  onCreated?: ((projectId: string) => void) | undefined;
};

/**
 * Side sheet to create a draft project (same form as /builder/projects/new).
 */
export const CreateProjectSheet = ({ open, onClose, onCreated }: CreateProjectSheetProps) => {
  const t = useTranslations('Builder.projects');
  const scope = useCatalogScope();
  const router = useRouter();

  return (
    <AdminCreateSheet
      open={open}
      onClose={onClose}
      title={t('new.title')}
      description={t('new.subtitle')}
      size="comfortable"
    >
      <CreateProjectForm
        onCreated={(project) => {
          onClose();
          if (onCreated) {
            onCreated(project.id);
            return;
          }
          router.push(catalogProjectDetailHref(scope, project.slug));
        }}
      />
    </AdminCreateSheet>
  );
};
