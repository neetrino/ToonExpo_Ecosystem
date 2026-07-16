'use client';

import type { PublicationStatus } from '@toonexpo/domain';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useState, useTransition } from 'react';

import { VisualMapFormError } from '@/components/visual-map/visual-map-form-error';

import { publicationActionsFor } from '@/lib/shared/publication';
import type { VisualMapMutationErrorKey } from '@/lib/visual-map/mutation-result';

import { deleteCanvasAction, setCanvasStatusAction } from '../../../../visual-map-actions';

type CanvasPublicationActionsProps = {
  locale: string;
  projectId: string;
  canvasId: string;
  status: PublicationStatus;
};

export function CanvasPublicationActions({
  locale,
  projectId,
  canvasId,
  status,
}: CanvasPublicationActionsProps) {
  const t = useTranslations('portal.visualMap.publication');
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errorKey, setErrorKey] = useState<VisualMapMutationErrorKey | undefined>();

  const actions = publicationActionsFor(status);

  function runStatusChange(targetStatus: PublicationStatus, confirmKey: string): void {
    if (!window.confirm(t(`confirm.${confirmKey}`))) {
      return;
    }

    setErrorKey(undefined);
    startTransition(async () => {
      const result = await setCanvasStatusAction(locale, { canvasId, status: targetStatus });
      if (!result.ok) {
        setErrorKey(result.errorKey);
        return;
      }
      router.refresh();
    });
  }

  function runDelete(): void {
    if (!window.confirm(t('confirm.delete'))) {
      return;
    }

    setErrorKey(undefined);
    startTransition(async () => {
      const result = await deleteCanvasAction(locale, { canvasId });
      if (!result.ok) {
        setErrorKey(result.errorKey);
        return;
      }
      router.push(`/portal/projects/${projectId}`);
      router.refresh();
    });
  }

  return (
    <div className="portal-visual-map-editor__actions">
      {actions.map((action) => (
        <button
          key={action.actionKey}
          type="button"
          className="portal-btn portal-btn--ghost portal-btn--sm"
          disabled={pending}
          onClick={() => runStatusChange(action.targetStatus, action.actionKey)}
        >
          {t(`actions.${action.actionKey}`)}
        </button>
      ))}

      {status === 'DRAFT' ? (
        <button
          type="button"
          className="portal-btn portal-btn--ghost portal-btn--sm"
          disabled={pending}
          onClick={runDelete}
        >
          {t('actions.delete')}
        </button>
      ) : null}

      <VisualMapFormError errorKey={errorKey} />
    </div>
  );
}
