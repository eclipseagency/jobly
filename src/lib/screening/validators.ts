/**
 * Validation logic for screening form answers
 */

import {
  QuestionType,
  AnswerValue,
  QuestionConfig,
  SelectConfig,
  NumberConfig,
  TextConfig,
  SalaryConfig,
  FileConfig,
  UrlListConfig,
  AvailabilityConfig,
  SalaryAnswer,
  FileAnswer,
  AvailabilityAnswer,
  WorkAuthorizationAnswer,
  ScreeningQuestion,
  AnswerSubmission,
  ValidationError,
  ValidationResult,
} from './types';

/**
 * Check if a value is empty/null/undefined
 */
function isEmpty(value: AnswerValue): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
}

/**
 * Validate YES_NO answer
 */
function validateYesNo(answer: AnswerValue, config: QuestionConfig): string | null {
  if (typeof answer !== 'boolean') {
    return 'Answer must be yes or no';
  }
  return null;
}

/**
 * Validate SINGLE_SELECT answer
 */
function validateSingleSelect(answer: AnswerValue, config: QuestionConfig): string | null {
  if (typeof answer !== 'string') {
    return 'Please select an option';
  }

  const selectConfig = config as SelectConfig;
  if (selectConfig?.choices && !selectConfig.choices.includes(answer)) {
    return 'Selected option is not valid';
  }

  return null;
}

/**
 * Validate MULTI_SELECT answer
 */
function validateMultiSelect(answer: AnswerValue, config: QuestionConfig): string | null {
  if (!Array.isArray(answer)) {
    return 'Please select one or more options';
  }

  if (!answer.every(item => typeof item === 'string')) {
    return 'Invalid selection format';
  }

  const selectConfig = config as SelectConfig;
  if (selectConfig?.choices) {
    const invalidChoices = answer.filter(item => !selectConfig.choices.includes(item));
    if (invalidChoices.length > 0) {
      return `Invalid options selected: ${invalidChoices.join(', ')}`;
    }
  }

  return null;
}

/**
 * Validate SHORT_TEXT answer
 */
function validateShortText(answer: AnswerValue, config: QuestionConfig): string | null {
  if (typeof answer !== 'string') {
    return 'Answer must be text';
  }

  const textConfig = config as TextConfig;

  if (textConfig?.minLength && answer.length < textConfig.minLength) {
    return `Answer must be at least ${textConfig.minLength} characters`;
  }

  if (textConfig?.maxLength && answer.length > textConfig.maxLength) {
    return `Answer must be no more than ${textConfig.maxLength} characters`;
  }

  if (textConfig?.regex) {
    try {
      const regex = new RegExp(textConfig.regex);
      if (!regex.test(answer)) {
        return 'Answer format is invalid';
      }
    } catch {
      // Invalid regex in config, skip validation
    }
  }

  return null;
}

/**
 * Validate LONG_TEXT answer
 */
function validateLongText(answer: AnswerValue, config: QuestionConfig): string | null {
  // Same validation as short text
  return validateShortText(answer, config);
}

/**
 * Validate NUMBER answer
 */
function validateNumber(answer: AnswerValue, config: QuestionConfig): string | null {
  if (typeof answer !== 'number' || isNaN(answer)) {
    return 'Answer must be a number';
  }

  const numConfig = config as NumberConfig;

  if (numConfig?.min !== undefined && answer < numConfig.min) {
    return `Value must be at least ${numConfig.min}`;
  }

  if (numConfig?.max !== undefined && answer > numConfig.max) {
    return `Value must be no more than ${numConfig.max}`;
  }

  return null;
}

/**
 * Validate DATE answer
 */
function validateDate(answer: AnswerValue, config: QuestionConfig): string | null {
  if (typeof answer !== 'string') {
    return 'Please provide a valid date';
  }

  const date = new Date(answer);
  if (isNaN(date.getTime())) {
    return 'Invalid date format';
  }

  return null;
}

/**
 * Validate SALARY_EXPECTATION answer
 */
function validateSalaryExpectation(answer: AnswerValue, config: QuestionConfig): string | null {
  if (typeof answer !== 'object' || answer === null) {
    return 'Please provide salary expectation';
  }

  const salaryAnswer = answer as SalaryAnswer;

  if (typeof salaryAnswer.amount !== 'number' || salaryAnswer.amount < 0) {
    return 'Please provide a valid salary amount';
  }

  if (!salaryAnswer.currency || typeof salaryAnswer.currency !== 'string') {
    return 'Please select a currency';
  }

  const validPeriods = ['hourly', 'daily', 'weekly', 'monthly', 'yearly'];
  if (!validPeriods.includes(salaryAnswer.period)) {
    return 'Please select a valid pay period';
  }

  const salaryConfig = config as SalaryConfig;

  if (salaryConfig?.minAmount && salaryAnswer.amount < salaryConfig.minAmount) {
    return `Minimum salary is ${salaryConfig.minAmount}`;
  }

  if (salaryConfig?.maxAmount && salaryAnswer.amount > salaryConfig.maxAmount) {
    return `Maximum salary is ${salaryConfig.maxAmount}`;
  }

  return null;
}

/**
 * Validate YEARS_OF_EXPERIENCE answer
 */
function validateYearsOfExperience(answer: AnswerValue, config: QuestionConfig): string | null {
  if (typeof answer !== 'number' || isNaN(answer)) {
    return 'Please provide years of experience as a number';
  }

  if (answer < 0) {
    return 'Years of experience cannot be negative';
  }

  if (answer > 60) {
    return 'Please provide a valid number of years';
  }

  const numConfig = config as NumberConfig;

  if (numConfig?.min !== undefined && answer < numConfig.min) {
    return `Minimum ${numConfig.min} years required`;
  }

  if (numConfig?.max !== undefined && answer > numConfig.max) {
    return `Maximum ${numConfig.max} years allowed`;
  }

  return null;
}

/**
 * Validate AVAILABILITY answer
 */
function validateAvailability(answer: AnswerValue, config: QuestionConfig): string | null {
  if (typeof answer !== 'object' || answer === null) {
    return 'Please provide availability information';
  }

  const availAnswer = answer as AvailabilityAnswer;

  if (typeof availAnswer.isImmediate !== 'boolean') {
    return 'Please indicate if you are immediately available';
  }

  if (!availAnswer.isImmediate) {
    if (!availAnswer.availableDate && availAnswer.noticePeriodDays === undefined) {
      return 'Please provide your available date or notice period';
    }

    if (availAnswer.availableDate) {
      const date = new Date(availAnswer.availableDate);
      if (isNaN(date.getTime())) {
        return 'Invalid availability date';
      }
    }

    if (availAnswer.noticePeriodDays !== undefined) {
      if (typeof availAnswer.noticePeriodDays !== 'number' || availAnswer.noticePeriodDays < 0) {
        return 'Invalid notice period';
      }
    }
  }

  const availConfig = config as AvailabilityConfig;

  if (availConfig?.maxNoticeDays && availAnswer.noticePeriodDays) {
    if (availAnswer.noticePeriodDays > availConfig.maxNoticeDays) {
      return `Notice period cannot exceed ${availConfig.maxNoticeDays} days`;
    }
  }

  return null;
}

/**
 * Validate WORK_AUTHORIZATION answer
 */
function validateWorkAuthorization(answer: AnswerValue, config: QuestionConfig): string | null {
  if (typeof answer !== 'object' || answer === null) {
    return 'Please provide work authorization information';
  }

  const authAnswer = answer as WorkAuthorizationAnswer;

  if (typeof authAnswer.authorized !== 'boolean') {
    return 'Please indicate if you are authorized to work';
  }

  if (authAnswer.expiryDate) {
    const date = new Date(authAnswer.expiryDate);
    if (isNaN(date.getTime())) {
      return 'Invalid authorization expiry date';
    }
  }

  return null;
}

/**
 * Validate URL_LIST answer
 */
function validateUrlList(answer: AnswerValue, config: QuestionConfig): string | null {
  if (!Array.isArray(answer)) {
    return 'Please provide URLs';
  }

  const urlPattern = /^https?:\/\/.+/i;

  for (const url of answer) {
    if (typeof url !== 'string' || !urlPattern.test(url)) {
      return `Invalid URL: ${url}`;
    }
  }

  const urlConfig = config as UrlListConfig;

  if (urlConfig?.maxUrls && answer.length > urlConfig.maxUrls) {
    return `Maximum ${urlConfig.maxUrls} URLs allowed`;
  }

  if (urlConfig?.requiredDomains && urlConfig.requiredDomains.length > 0) {
    for (const url of answer) {
      try {
        const urlObj = new URL(url);
        const matchesDomain = urlConfig.requiredDomains.some(domain =>
          urlObj.hostname.includes(domain)
        );
        if (!matchesDomain) {
          return `URL must be from: ${urlConfig.requiredDomains.join(', ')}`;
        }
      } catch {
        return `Invalid URL format: ${url}`;
      }
    }
  }

  return null;
}

/**
 * Validate FILE_UPLOAD answer
 */
function validateFileUpload(answer: AnswerValue, config: QuestionConfig): string | null {
  // Can be single file or array of files
  const files = Array.isArray(answer) ? answer : [answer];

  if (files.length === 0 || (files.length === 1 && isEmpty(files[0]))) {
    return 'Please upload a file';
  }

  const fileConfig = config as FileConfig;

  for (const file of files) {
    if (typeof file !== 'object' || file === null) {
      return 'Invalid file format';
    }

    const fileAnswer = file as FileAnswer;

    if (!fileAnswer.url || typeof fileAnswer.url !== 'string') {
      return 'File upload failed';
    }

    if (!fileAnswer.filename || typeof fileAnswer.filename !== 'string') {
      return 'Invalid filename';
    }

    if (fileConfig?.maxSize && fileAnswer.size > fileConfig.maxSize) {
      const maxSizeMB = (fileConfig.maxSize / 1024 / 1024).toFixed(1);
      return `File size must be less than ${maxSizeMB}MB`;
    }

    if (fileConfig?.allowedTypes && fileConfig.allowedTypes.length > 0) {
      const ext = fileAnswer.filename.split('.').pop()?.toLowerCase();
      if (!ext || !fileConfig.allowedTypes.includes(ext)) {
        return `Allowed file types: ${fileConfig.allowedTypes.join(', ')}`;
      }
    }
  }

  if (fileConfig?.maxFiles && files.length > fileConfig.maxFiles) {
    return `Maximum ${fileConfig.maxFiles} files allowed`;
  }

  return null;
}

/**
 * Main validation function for a single answer
 */
export function validateAnswer(
  questionType: QuestionType,
  answer: AnswerValue,
  config: QuestionConfig,
  isRequired: boolean
): string | null {
  // Check required
  if (isEmpty(answer)) {
    if (isRequired) {
      return 'This field is required';
    }
    return null; // Optional and empty is valid
  }

  // Type-specific validation
  switch (questionType) {
    case 'YES_NO':
      return validateYesNo(answer, config);
    case 'SINGLE_SELECT':
      return validateSingleSelect(answer, config);
    case 'MULTI_SELECT':
      return validateMultiSelect(answer, config);
    case 'SHORT_TEXT':
      return validateShortText(answer, config);
    case 'LONG_TEXT':
      return validateLongText(answer, config);
    case 'NUMBER':
      return validateNumber(answer, config);
    case 'DATE':
      return validateDate(answer, config);
    case 'SALARY_EXPECTATION':
      return validateSalaryExpectation(answer, config);
    case 'YEARS_OF_EXPERIENCE':
      return validateYearsOfExperience(answer, config);
    case 'AVAILABILITY':
      return validateAvailability(answer, config);
    case 'WORK_AUTHORIZATION':
      return validateWorkAuthorization(answer, config);
    case 'URL_LIST':
      return validateUrlList(answer, config);
    case 'FILE_UPLOAD':
      return validateFileUpload(answer, config);
    default:
      return 'Unknown question type';
  }
}

/**
 * Validate all answers for a screening form
 */
export function validateAllAnswers(
  questions: ScreeningQuestion[],
  answers: AnswerSubmission[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const answerMap = new Map(answers.map(a => [a.questionId, a.answer]));

  for (const question of questions) {
    const answer = answerMap.get(question.id);

    // Check for missing required questions
    if (question.isRequired && !answerMap.has(question.id)) {
      errors.push({
        questionId: question.id,
        message: 'This field is required',
      });
      continue;
    }

    // Validate the answer
    const error = validateAnswer(
      question.questionType,
      answer ?? null,
      question.config,
      question.isRequired
    );

    if (error) {
      errors.push({
        questionId: question.id,
        message: error,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
