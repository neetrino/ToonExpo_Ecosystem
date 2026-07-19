/**
 * Builds a create-canvas body omitting unset optional fields (exactOptionalPropertyTypes).
 */
export const toCreateCanvasBody = (values: {
  contextType: "project" | "building" | "floor";
  contextId: string;
  mediaAssetId: string;
  title?: string | undefined;
  description?: string | undefined;
  isPrimary?: boolean | undefined;
}) => {
  const body: {
    contextType: "project" | "building" | "floor";
    contextId: string;
    mediaAssetId: string;
    title?: string;
    description?: string;
    isPrimary?: boolean;
  } = {
    contextType: values.contextType,
    contextId: values.contextId,
    mediaAssetId: values.mediaAssetId,
  };

  if (values.title) {
    body.title = values.title;
  }
  if (values.description) {
    body.description = values.description;
  }
  if (values.isPrimary != null) {
    body.isPrimary = values.isPrimary;
  }

  return body;
};

/**
 * Builds a hotspot create/update body omitting unset optional fields.
 */
export const toHotspotBody = (values: {
  targetType: "building" | "floor" | "apartment";
  targetId: string;
  label: string;
  xPercent: number;
  yPercent: number;
  markerStyle?: string | undefined;
  publicationStatus?: "draft" | "published" | "archived" | undefined;
}) => {
  const body: {
    targetType: "building" | "floor" | "apartment";
    targetId: string;
    label: string;
    xPercent: number;
    yPercent: number;
    markerStyle?: string;
    publicationStatus?: "draft" | "published" | "archived";
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
