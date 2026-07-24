'use client';

import { ImageLightbox } from '@/shared/ui/image-lightbox';

type FloorPlanLightboxProps = {
  open: boolean;
  imageUrl: string;
  alt: string;
  onClose: () => void;
};

/**
 * Floor-plan fullscreen viewer — shared image lightbox.
 */
export const FloorPlanLightbox = (props: FloorPlanLightboxProps) => <ImageLightbox {...props} />;
