// Re-export Prisma types for convenience
export type {
  User,
  UserSession,
  OtpRequest,
  Company,
  CompanyMember,
  JobseekerProfile,
  Skill,
  JobseekerProfileSkill,
  JobseekerExperience,
  JobseekerEducation,
  VerificationRequest,
  Job,
  JobSkill,
  JobScreeningQuestion,
  Application,
  ApplicationNote,
  Conversation,
  Message,
  Plan,
  CompanySubscription,
  CreditWallet,
  Payment,
  Invoice,
  CandidateUnlock,
  CreditLedger,
} from "@prisma/client";

// Re-export enums
export {
  UserRole,
  RecordStatus,
  CompanyVerificationStatus,
  VerificationType,
  VerificationStatus,
  EmploymentType,
  JobStatus,
  ApplicationStatus,
  ScreeningQuestionType,
  MessageType,
  SubscriptionStatus,
  LedgerType,
  LedgerRefType,
  PaymentProvider,
  PaymentType,
  PaymentStatus,
} from "@prisma/client";

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface OtpPurpose {
  LOGIN: "LOGIN";
  REGISTER: "REGISTER";
  RESET_PASSWORD: "RESET_PASSWORD";
}

export interface RequestOtpPayload {
  phone: string;
  purpose: keyof OtpPurpose;
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
}

// User session context
export interface SessionUser {
  id: string;
  role: string;
  phone: string;
  email?: string | null;
  companyId?: string;
}

// Job search filters
export interface JobFilters {
  query?: string;
  category?: string;
  city?: string;
  province?: string;
  employmentType?: string;
  salaryMin?: number;
  salaryMax?: number;
  page?: number;
  limit?: number;
}

// Talent search filters
export interface TalentFilters {
  query?: string;
  skills?: string[];
  city?: string;
  province?: string;
  employmentTypes?: string[];
  yearsExperienceMin?: number;
  yearsExperienceMax?: number;
  page?: number;
  limit?: number;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
