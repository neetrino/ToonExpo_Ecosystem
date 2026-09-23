'use client';

import type { ProjectCatalogDetails } from '@/features/catalog/utils/project-catalog-details';
import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import type { UpdateProjectFormValues } from '@/features/builder/schemas/project.schema';
import { DatePicker } from '@/shared/ui/date-picker';
import { parseFlexibleDateToIso } from '@/shared/ui/date-picker-utils';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

type SharedCatalogKind = 'input' | 'textarea' | 'date';

type ProjectCatalogSharedValueProps = {
  fieldId: string;
  fieldKey: keyof ProjectCatalogDetails;
  control: Control<UpdateProjectFormValues>;
  kind: SharedCatalogKind;
  className?: string | undefined;
  placeholder?: string | undefined;
  ariaLabel?: string | undefined;
};

const sharedText = (next: string): { hy: string; ru: string; en: string } => ({
  hy: next,
  ru: next,
  en: next,
});

/**
 * One admin control for a catalog value that is identical in hy / ru / en.
 */
export const ProjectCatalogSharedValue = ({
  fieldId,
  fieldKey,
  control,
  kind,
  className,
  placeholder,
  ariaLabel,
}: ProjectCatalogSharedValueProps) => (
  <Controller
    control={control}
    name={`catalogDetails.${fieldKey}`}
    render={({ field }) => (
      <SharedCatalogControl
        fieldId={fieldId}
        name={field.name}
        kind={kind}
        value={field.value.hy}
        className={className}
        placeholder={placeholder}
        ariaLabel={ariaLabel}
        onBlur={field.onBlur}
        onChange={(next) => field.onChange(sharedText(next))}
      />
    )}
  />
);

type SharedCatalogControlProps = {
  fieldId: string;
  name: string;
  kind: SharedCatalogKind;
  value: string;
  className: string | undefined;
  placeholder: string | undefined;
  ariaLabel: string | undefined;
  onBlur: () => void;
  onChange: (next: string) => void;
};

const SharedCatalogControl = ({
  fieldId,
  name,
  kind,
  value,
  className,
  placeholder,
  ariaLabel,
  onBlur,
  onChange,
}: SharedCatalogControlProps) => {
  if (kind === 'date') {
    return (
      <div className="min-w-0 w-full">
        <DatePicker
          id={fieldId}
          name={name}
          value={parseFlexibleDateToIso(value)}
          aria-label={ariaLabel ?? fieldId}
          onBlur={onBlur}
          onChange={onChange}
          className="h-10 w-full min-w-0 justify-start text-left text-sm font-semibold text-ink-navy"
        />
      </div>
    );
  }

  if (kind === 'textarea') {
    return (
      <Textarea
        id={fieldId}
        rows={3}
        placeholder={placeholder}
        className={className}
        value={value}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  return (
    <Input
      id={fieldId}
      placeholder={placeholder}
      className={className}
      value={value}
      onBlur={onBlur}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};
