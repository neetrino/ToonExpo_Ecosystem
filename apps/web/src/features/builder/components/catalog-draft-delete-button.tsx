'use client';

import { Trash2 } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';

type CatalogDraftDeleteButtonProps = {
  label: string;
  iconOnly: boolean;
  disabled: boolean;
  onClick: () => void;
};

/**
 * Draft delete trigger — icon-only on admin, labeled on the builder portal.
 */
export const CatalogDraftDeleteButton = ({
  label,
  iconOnly,
  disabled,
  onClick,
}: CatalogDraftDeleteButtonProps) => {
  if (iconOnly) {
    return (
      <IconButton
        label={label}
        size="sm"
        className="text-danger hover:bg-danger-soft"
        disabled={disabled}
        onClick={onClick}
      >
        <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
      </IconButton>
    );
  }

  return (
    <Button type="button" size="sm" variant="danger" disabled={disabled} onClick={onClick}>
      <Trash2 className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
      {label}
    </Button>
  );
};
