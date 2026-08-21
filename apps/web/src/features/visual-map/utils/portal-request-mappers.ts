/**
 * Builds a hotspot create/update body omitting unset optional fields.
 */
export const toHotspotBody = (values: {
  targetType: 'district' | 'building' | 'floor' | 'apartment';
  targetId: string;
  label: string;
  xPercent: number;
  yPercent: number;
  markerStyle?: string | undefined;
  publicationStatus?: 'draft' | 'published' | 'archived' | undefined;
}) => {
  const body: {
    targetType: 'district' | 'building' | 'floor' | 'apartment';
    targetId: string;
    label: string;
    xPercent: number;
    yPercent: number;
    markerStyle?: string;
    publicationStatus?: 'draft' | 'published' | 'archived';
  } = {
    targetType: values.targetType,
    targetId: values.targetId,
    label: values.label,
    xPercent: values.xPercent,
    yPercent: values.yPercent,
  };

  const markerStyle = values.markerStyle?.trim();
  if (markerStyle) {
    body.markerStyle = markerStyle;
  }
  if (values.publicationStatus) {
    body.publicationStatus = values.publicationStatus;
  }

  return body;
};
