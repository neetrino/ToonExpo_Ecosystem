import type { ReactNode } from 'react';

export type SideSheetProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function SideSheet({ title, open, onClose, children }: SideSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="toonexpo-side-sheet" role="dialog" aria-modal="true" aria-label={title}>
      <div className="toonexpo-side-sheet__backdrop" onClick={onClose} />
      <aside className="toonexpo-side-sheet__panel">
        <header className="toonexpo-side-sheet__header">
          <h2>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="toonexpo-side-sheet__body">{children}</div>
      </aside>
    </div>
  );
}
