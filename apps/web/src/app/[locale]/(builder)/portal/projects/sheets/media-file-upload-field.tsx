'use client';

import { ImageUploadField } from '@/components/portal-forms/image-upload-field';

type MediaFileUploadFieldProps = {
  initialUrl: string;
  required: boolean;
};

/** @deprecated Prefer {@link ImageUploadField} with purpose `MEDIA`. */
export function MediaFileUploadField({ initialUrl, required }: MediaFileUploadFieldProps) {
  return (
    <ImageUploadField
      name="url"
      purpose="MEDIA"
      initialUrl={initialUrl}
      required={required}
      i18nNamespace="portal.mediaForm"
    />
  );
}
