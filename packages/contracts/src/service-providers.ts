/**
 * Service Provider Directory contracts (admin + builder portal).
 */

import type { PublicationStatus } from "./catalog.js";

export type ServiceProviderType = "company" | "person" | "team" | "other";

export type ServiceProviderCategoryItem = {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ServiceProviderCategoryListResponse = {
  data: ServiceProviderCategoryItem[];
};

export type CreateServiceProviderCategoryBody = {
  name: string;
  description?: string;
  sortOrder?: number;
  active?: boolean;
};

export type UpdateServiceProviderCategoryBody = {
  name?: string;
  description?: string | null;
  sortOrder?: number;
  active?: boolean;
};

export type ServiceProviderCategoryRef = {
  id: string;
  name: string;
};

export type AdminServiceProviderItem = {
  id: string;
  name: string;
  providerType: ServiceProviderType;
  description: string | null;
  services: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  socialLinks: Record<string, string> | null;
  internalNotes: string | null;
  active: boolean;
  publicationStatus: PublicationStatus | null;
  categories: ServiceProviderCategoryRef[];
  createdByUserId: string;
  updatedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminServiceProviderListResponse = {
  data: AdminServiceProviderItem[];
};

export type CreateServiceProviderBody = {
  name: string;
  providerType: ServiceProviderType;
  description?: string;
  services?: string;
  phone?: string;
  email?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  internalNotes?: string;
  active?: boolean;
  publicationStatus?: PublicationStatus;
  categoryIds?: string[];
};

export type UpdateServiceProviderBody = {
  name?: string;
  providerType?: ServiceProviderType;
  description?: string | null;
  services?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  socialLinks?: Record<string, string> | null;
  internalNotes?: string | null;
  active?: boolean;
  publicationStatus?: PublicationStatus | null;
  categoryIds?: string[];
};

export type PortalServiceProviderItem = {
  id: string;
  name: string;
  providerType: ServiceProviderType;
  description: string | null;
  services: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  socialLinks: Record<string, string> | null;
};

export type PortalServiceProviderListResponse = {
  data: PortalServiceProviderItem[];
};
