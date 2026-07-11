'use client';

import type { AdminReadinessAssessment } from '@toonexpo/contracts';
import { useEffect, useState } from 'react';

import type { AdminTargetOption, ReadinessCategoryOption } from '@/lib/admin/readiness-queries';

import { AssessmentFormSheet } from './sheets/assessment-form-sheet';

type NewAssessmentButtonProps = {
  locale: string;
  label: string;
  categories: ReadinessCategoryOption[];
  companies: AdminTargetOption[];
  projects: AdminTargetOption[];
  editAssessment: AdminReadinessAssessment | null;
};

export function NewAssessmentButton({
  locale,
  label,
  categories,
  companies,
  projects,
  editAssessment,
}: NewAssessmentButtonProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    if (editAssessment) {
      setMode('edit');
      setOpen(true);
    }
  }, [editAssessment]);

  return (
    <>
      <button
        type="button"
        className="portal-btn portal-btn--primary"
        onClick={() => {
          setMode('create');
          setOpen(true);
        }}
      >
        {label}
      </button>
      <AssessmentFormSheet
        locale={locale}
        mode={mode}
        open={open}
        onClose={() => setOpen(false)}
        categories={categories}
        companies={companies}
        projects={projects}
        values={mode === 'edit' ? (editAssessment ?? undefined) : undefined}
      />
    </>
  );
}
