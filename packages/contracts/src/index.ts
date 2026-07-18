/**
 * Health check response returned by NestJS `/api/v1/health`.
 */
export type HealthResponse = {
  status: "ok" | "degraded" | "error";
  service: string;
  timestamp: string;
};

/**
 * API version prefix used by NestJS controllers.
 */
export const API_V1_PREFIX = "/api/v1" as const;

export {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
} from "./auth.js";

export type {
  AccountType,
  AuthSessionResponse,
  CompanyMemberRole,
  CompanyMemberStatus,
  CompanyType,
  CsrfTokenResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  RegisterRequest,
  UserResponse,
  UserStatus,
} from "./auth.js";

export type {
  ApartmentAvailabilitySummary,
  ApartmentDetail,
  ApartmentSalesStatus,
  BuilderSummary,
  BuildingSummary,
  FloorApartmentSummary,
  FloorSummary,
  ListProjectsQuery,
  MediaAssetSummary,
  PaginatedResponse,
  PriceVisibility,
  ProjectDetail,
  ProjectListItem,
  PublicationStatus,
} from "./catalog.js";

export type {
  CompanyListResponse,
  CompanyMemberListResponse,
  CompanyMemberResponse,
  CompanyProfileResponse,
  CompanyResponse,
  CompanySource,
  CompanyStatus,
  CreateCompanyRequest,
  InviteCompanyMemberRequest,
  ProvisionCompanyResponse,
  SetPasswordRequest,
  UpdateCompanyMemberRequest,
  UpdateCompanyRequest,
} from "./companies.js";

export type {
  BulkCreatePortalApartmentsRequest,
  CreatePortalApartmentRequest,
  CreatePortalBuildingRequest,
  CreatePortalFloorRequest,
  CreatePortalProjectRequest,
  LocaleTextMap,
  PortalApartmentDetail,
  PortalApartmentStatusHistoryItem,
  PortalBuildingSummary,
  PortalFloorSummary,
  PortalProjectDetail,
  PortalProjectListItem,
  PortalProjectListResponse,
  PortalTranslationsInput,
  UpdatePortalApartmentRequest,
  UpdatePortalBuildingRequest,
  UpdatePortalFloorRequest,
  UpdatePortalProjectRequest,
  UpdatePortalPublicationRequest,
} from "./portal.js";

export type {
  BuyerQrResponse,
  BuyerQrScanHistoryItem,
  BuyerQrScanHistoryResponse,
  ProjectQrResponse,
  QrBuyerActionPayload,
  QrBuyerIdentity,
  QrCodeStatus,
  QrEntranceCheckinPayload,
  QrOwnerProfilePayload,
  QrResolveKind,
  QrResolveResponse,
  QrScanContext,
  QrScanResultStatus,
  ResolveQrRequest,
} from "./qr.js";

export type {
  AttachCrmDealApartmentBody,
  BuyerFacingRequestStatus,
  BuyerRequestListItem,
  BuyerRequestListResponse,
  CreateBuyerRequestBody,
  CreateCrmActivityBody,
  CreateCrmNoteBody,
  CreateDealFromScanBody,
  CreateManualDealBody,
  CrmActivityItem,
  CrmActivityStatus,
  CrmActivityType,
  CrmApartmentLinkItem,
  CrmBuyerContact,
  CrmDealApartmentLinkType,
  CrmDealDetail,
  CrmDealListItem,
  CrmDealListResponse,
  CrmDealStatus,
  CrmNoteItem,
  CrmNoteVisibility,
  CrmRequestHistoryItem,
  IntakeCreateResult,
  RequestSource,
  RequestStatus,
  UpdateCrmActivityBody,
  UpdateCrmDealBody,
} from "./crm.js";

export type {
  CreateReadinessAssessmentBody,
  CreateReadinessCategoryBody,
  CreateReadinessInternalNoteBody,
  CreateReadinessRecommendationBody,
  CreateReadinessRequiredActionBody,
  PortalReadinessAssessmentItem,
  PortalReadinessRecommendationItem,
  PortalReadinessRequiredActionItem,
  PortalReadinessResponse,
  PortalReadinessScoreItem,
  ReadinessAssessmentDetail,
  ReadinessAssessmentListItem,
  ReadinessAssessmentListResponse,
  ReadinessAssessmentTargetType,
  ReadinessCategoryItem,
  ReadinessCategoryListResponse,
  ReadinessInternalNoteItem,
  ReadinessRecommendationItem,
  ReadinessRequiredActionItem,
  ReadinessRequiredActionStatus,
  ReadinessScoreItem,
  ReadinessScoreStatus,
  ReadinessVisibility,
  UpdateReadinessAssessmentBody,
  UpdateReadinessCategoryBody,
  UpdateReadinessRecommendationBody,
  UpdateReadinessRequiredActionBody,
  UpsertReadinessScoreBody,
} from "./readiness.js";

export type {
  AdminPartnerDetail,
  AdminPartnerListItem,
  AdminPartnerListResponse,
  CreateAdminPartnerBody,
  CreatePartnerOfferBody,
  PartnerCompanyStatus,
  PartnerCompanyType,
  PartnerContacts,
  PartnerOfferItem,
  PartnerOfferTranslationsInput,
  PartnerProfileTranslationsInput,
  PartnerSocialLinks,
  PortalPartnerDetail,
  PublicPartnerDetail,
  PublicPartnerListItem,
  PublicPartnerListResponse,
  PublicPartnerOfferItem,
  UpdateAdminPartnerBody,
  UpdatePartnerOfferBody,
  UpdatePortalPartnerBody,
} from "./partners.js";
