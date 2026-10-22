import { Button } from '@/shared/ui/button';

type ReadinessSaveBarProps = {
  hint: string;
  error: string | null;
  busy: boolean;
  dirty: boolean;
  saveLabel: string;
  onSave: () => void;
};

/** Pinned save row for the readiness management sheet. */
export const ReadinessSaveBar = ({
  hint,
  error,
  busy,
  dirty,
  saveLabel,
  onSave,
}: ReadinessSaveBarProps) => (
  <div className="flex flex-col gap-2">
    {error ? (
      <p role="alert" className="text-sm text-danger">
        {error}
      </p>
    ) : null}
    <div className="flex items-center justify-between gap-3">
      <p className="min-w-0 text-xs text-ink-secondary">{hint}</p>
      <Button type="button" className="shrink-0" onClick={onSave} disabled={!dirty || busy}>
        {saveLabel}
      </Button>
    </div>
  </div>
);
