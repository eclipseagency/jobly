/**
 * Type definitions for the screening form system
 */

// Question types matching Prisma enum
export type QuestionType =
  | 'YES_NO'
  | 'SINGLE_SELECT'
  | 'MULTI_SELECT'
  | 'SHORT_TEXT'
  | 'LONG_TEXT'
  | 'NUMBER'
  | 'DATE'
  | 'SALARY_EXPECTATION'
  | 'YEARS_OF_EXPERIENCE'
  | 'AVAILABILITY'
  | 'WORK_AUTHORIZATION'
  | 'URL_LIST'
  | 'FILE_UPLOAD';

// Rule types matching Prisma enum
export type RuleType = 'KNOCKOUT' | 'SCORE';

// Rule operators matching Prisma enum
export type RuleOperator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'CONTAINS'
  | 'NOT_CONTAINS'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'GREATER_THAN_OR_EQUAL'
  | 'LESS_THAN_OR_EQUAL'
  | 'IN_LIST'
  | 'NOT_IN_LIST'
  | 'IS_EMPTY'
  | 'IS_NOT_EMPTY';

// Question configuration types
export interface SelectConfig {
  choices: string[];
}

export interface NumberConfig {
  min?: number;
  max?: number;
}

export interface TextConfig {
  minLength?: number;
  maxLength?: number;
  regex?: string;
}

export interface SalaryConfig {
  currency?: string;
  period?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  minAmount?: number;
  maxAmount?: number;
}

export interface FileConfig {
  maxSize?: number; // in bytes
  allowedTypes?: string[]; // file extensions
  maxFiles?: number;
}

export interface UrlListConfig {
  maxUrls?: number;
  requiredDomains?: string[]; // e.g., ["linkedin.com", "github.com"]
}

export interface AvailabilityConfig {
  allowImmediate?: boolean;
  maxNoticeDays?: number;
}

export type QuestionConfig =
  | SelectConfig
  | NumberConfig
  | TextConfig
  | SalaryConfig
  | FileConfig
  | UrlListConfig
  | AvailabilityConfig
  | null;

// Answer value types
export type YesNoAnswer = boolean;
export type SingleSelectAnswer = string;
export type MultiSelectAnswer = string[];
export type TextAnswer = string;
export type NumberAnswer = number;
export type DateAnswer = string; // ISO date string

export interface SalaryAnswer {
  amount: number;
  currency: string;
  period: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface FileAnswer {
  url: string;
  filename: string;
  size: number;
  type: string;
}

export interface AvailabilityAnswer {
  isImmediate: boolean;
  availableDate?: string; // ISO date string
  noticePeriodDays?: number;
}

export interface WorkAuthorizationAnswer {
  authorized: boolean;
  visaType?: string;
  expiryDate?: string;
  requiresSponsorship?: boolean;
}

export type AnswerValue =
  | YesNoAnswer
  | SingleSelectAnswer
  | MultiSelectAnswer
  | TextAnswer
  | NumberAnswer
  | DateAnswer
  | SalaryAnswer
  | FileAnswer
  | FileAnswer[] // for multiple files
  | AvailabilityAnswer
  | WorkAuthorizationAnswer
  | string[] // for URL_LIST
  | null;

// Question interface
export interface ScreeningQuestion {
  id: string;
  questionText: string;
  questionType: QuestionType;
  order: number;
  isRequired: boolean;
  config: QuestionConfig;
  helpText?: string;
  placeholder?: string;
  rules: ScreeningRule[];
}

// Rule interface
export interface ScreeningRule {
  id: string;
  ruleType: RuleType;
  operator: RuleOperator;
  value: unknown; // JSON value for comparison
  scoreValue?: number;
  message?: string;
  priority: number;
  isActive: boolean;
}

// Form interface
export interface ScreeningForm {
  id: string;
  jobId: string;
  version: number;
  isActive: boolean;
  title?: string;
  description?: string;
  shortlistThreshold?: number;
  passingThreshold?: number;
  questions: ScreeningQuestion[];
}

// Answer submission
export interface AnswerSubmission {
  questionId: string;
  answer: AnswerValue;
}

// Validation result
export interface ValidationError {
  questionId: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Rule evaluation result
export interface RuleEvaluationResult {
  questionId: string;
  ruleId: string;
  triggered: boolean;
  ruleType: RuleType;
  scoreValue?: number;
  message?: string;
}

// Answer evaluation result
export interface AnswerEvaluationResult {
  questionId: string;
  isKnockout: boolean;
  scoreEarned: number;
  knockoutMessage?: string;
  triggeredRules: RuleEvaluationResult[];
}

// Overall screening result
export interface ScreeningResult {
  isValid: boolean;
  validationErrors: ValidationError[];
  totalScore: number;
  hasKnockout: boolean;
  knockoutReason?: string;
  recommendedStatus: 'rejected' | 'new' | 'shortlisted';
  answerResults: AnswerEvaluationResult[];
}
