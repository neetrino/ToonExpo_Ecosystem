'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { ensureAdminProjectReadinessAssessments } from '@/features/admin/api/admin-readiness-api';
import { ADMIN_READINESS_ASSESSMENTS_QUERY_KEY } from '@/features/admin/constants';

/**
 * Creates missing project assessments once the projects list has loaded.
 */
export const useEnsureProjectReadinessAssessments = (ready: boolean): boolean => {
  const queryClient = useQueryClient();
  const [isEnsuring, setIsEnsuring] = useState(false);
  const ensureRanRef = useRef(false);

  useEffect(() => {
    if (ensureRanRef.current || !ready) {
      return;
    }
    ensureRanRef.current = true;
    setIsEnsuring(true);
    void ensureAdminProjectReadinessAssessments()
      .then(async (result) => {
        if (result.createdCount > 0) {
          await queryClient.invalidateQueries({
            queryKey: ADMIN_READINESS_ASSESSMENTS_QUERY_KEY,
          });
        }
      })
      .catch(() => {
        ensureRanRef.current = false;
      })
      .finally(() => {
        setIsEnsuring(false);
      });
  }, [queryClient, ready]);

  return isEnsuring;
};
